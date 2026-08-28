import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";

export async function artistRoutes(server: FastifyInstance) {
  // Get all artists
  server.get("/api/artists", async () => {
    return prisma.artists.findMany({
      orderBy: {
        name: "asc",
      },
    });
  });

  // Get one artist with their albums
  server.get<{ Params: { id: string } }>(
    "/api/artists/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      if (Number.isNaN(id)) {
        return reply.code(400).send({
          error: "Invalid artist ID",
        });
      }

      const artist = await prisma.artists.findUnique({
        where: {
          id,
        },
        include: {
          albums: {
            include: {
              artists: true,
            },
            orderBy: {
              year: "desc",
            },
          },
        },
      });

      if (!artist) {
        return reply.code(404).send({
          error: "Artist not found",
        });
      }

      return artist;
    }
  );
}