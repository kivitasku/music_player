import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { prisma } from "../lib/prisma.js";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.session.get("userId");

  if (userId === undefined) {
    return reply.code(401).send({
      error: "Authentication required",
    });
  }

  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    request.session.delete();

    return reply.code(401).send({
      error: "User not found",
    });
  }
}