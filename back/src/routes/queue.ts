import type { FastifyInstance } from "fastify";

import { authenticate } from "../hooks/auth.js";

export async function queueRoutes(server: FastifyInstance) {
  server.post(
    "/api/queue/next",
    {
      preHandler: authenticate,
    },
    async (_request, reply) => {
      return reply.code(400).send({
        error: "Queue is empty",
      });
    }
  );
}