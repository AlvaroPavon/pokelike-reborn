import { afterAll, beforeAll, describe, expect, it } from "vitest";
import Fastify from "fastify";
import { io as createClient, type Socket } from "socket.io-client";
import { authRoutes } from "../routes/auth.js";
import { initSocketServer } from "../sockets/index.js";

function once<T>(socket: Socket, event: string): Promise<T> {
  return new Promise((resolve) => socket.once(event, (payload: T) => resolve(payload)));
}

describe("Socket.io live flow", () => {
  const app = Fastify({ logger: false });
  let baseUrl = "";

  beforeAll(async () => {
    await app.register(authRoutes);
    initSocketServer(app);
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (typeof address !== "object" || !address) throw new Error("Server did not bind");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndLogin(email: string): Promise<string> {
    await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { email, password: "testpass123" },
    });
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email, password: "testpass123" },
    });
    return JSON.parse(login.payload).token as string;
  }

  it("rejects unauthenticated sockets", async () => {
    const socket = createClient(baseUrl, { transports: ["websocket"], forceNew: true, reconnection: false });
    const err = await once<Error>(socket, "connect_error");
    expect(err.message).toBe("Authentication required");
    socket.disconnect();
  });

  it("pairs two authenticated sockets and streams battle events", async () => {
    const token1 = await registerAndLogin(`live-a-${Date.now()}@example.com`);
    const token2 = await registerAndLogin(`live-b-${Date.now()}@example.com`);

    const a = createClient(baseUrl, { auth: { token: token1 }, transports: ["websocket"], forceNew: true });
    const b = createClient(baseUrl, { auth: { token: token2 }, transports: ["websocket"], forceNew: true });

    await Promise.all([once(a, "connect"), once(b, "connect")]);

    const aStart = once<{ roomId: string }>(a, "battle:start");
    const bStart = once<{ roomId: string }>(b, "battle:start");
    const aLog = once(a, "battle:log");
    const bResult = once<{ winnerUserId: string | null }>(b, "battle:result");

    a.emit("queue:join");
    b.emit("queue:join");

    const [startA, startB] = await Promise.all([aStart, bStart]);
    expect(startA.roomId).toBe(startB.roomId);
    await expect(aLog).resolves.toBeTruthy();
    await expect(bResult).resolves.toHaveProperty("winnerUserId");

    a.disconnect();
    b.disconnect();
  });
});
