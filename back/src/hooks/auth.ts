import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

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
}