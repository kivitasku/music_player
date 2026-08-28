import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";

export async function albumRoutes(server: FastifyInstance) {
  // Get all albums
  server.get("/api/albums", async () => {
    return prisma.albums.findMany({
      include: {
        artists: true,
      },
    });
  });

  // Get one album
  server.get<{ Params: { id: string } }>(
    "/api/albums/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      if (Number.isNaN(id)) {
        return reply.code(400).send({
          error: "Invalid album ID",
        });
      }

      const album = await prisma.albums.findUnique({
        where: {
          id,
        },
        include: {
          artists: true,
          songs: {
            orderBy: {
              track_no: "asc",
            },
            include: {
              artists: true,
              albums: true,
            },
        },
        },
      });

      if (!album) {
        return reply.code(404).send({
          error: "Album not found",
        });
      }

      return album;
    }
  );
}