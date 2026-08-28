import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function songRoutes(server: FastifyInstance) {
  // Get all songs
  server.get("/api/songs", async () => {
    const songs = await prisma.songs.findMany({
      include: {
        artists: true,
        albums: true
      }
    });

    return songs;
  });

  // Get one song
  server.get<{ Params: { id: string } }>(
    "/api/songs/:id",
    async (request, reply) => {
      const id = Number(request.params.id);

      if (Number.isNaN(id)) {
        return reply.code(400).send({
          error: "Invalid song ID"
        });
      }

      const song = await prisma.songs.findUnique({
        where: {
          id
        },
        include: {
          artists: true,
          albums: true
        }
      });

      if (!song) {
        return reply.code(404).send({
          error: "Song not found"
        });
      }

      return song;
    }
  );
}