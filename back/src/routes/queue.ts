import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";
import { authenticate } from "../hooks/auth.js";

const MAX_QUEUE_SIZE = 25;

export async function queueRoutes(server: FastifyInstance) {
  // Add a song to the current user's queue
  server.post(
    "/api/queue/add",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const userId = request.session.get("userId");

      if (userId === undefined) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      const { songId } = request.body as {
        songId?: number;
      };

      if (songId === undefined) {
        return reply.code(400).send({
          error: "songId is required",
        });
      }

      const song = await prisma.songs.findUnique({
        where: {
          id: songId,
        },
      });

      if (!song) {
        return reply.code(404).send({
          error: "Song not found",
        });
      }

      const queueSize = await prisma.user_queue.count({
        where: {
          user_id: userId,
        },
      });

      if (queueSize >= MAX_QUEUE_SIZE) {
        return reply.code(400).send({
          error: `Queue cannot contain more than ${MAX_QUEUE_SIZE} songs`,
        });
      }

      const queueItem = await prisma.user_queue.create({
        data: {
          user_id: userId,
          song_id: songId,
          position: queueSize + 1,
        },
        include: {
          songs: {
            include: {
              artists: true,
              albums: true,
            },
          },
        },
      });

      return queueItem.songs;
    }
  );

  // Get the next song in the current user's queue
  server.post(
    "/api/queue/next",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const userId = request.session.get("userId");

      if (userId === undefined) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      const nextQueueItem = await prisma.user_queue.findFirst({
        where: {
          user_id: userId,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          songs: {
            include: {
              artists: true,
              albums: true,
            },
          },
        },
      });

      if (!nextQueueItem) {
        return reply.code(400).send({
          error: "Queue is empty",
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.user_queue.delete({
          where: {
            id: nextQueueItem.id,
          },
        });

        await tx.user_queue.updateMany({
          where: {
            user_id: userId,
            position: {
              gt: nextQueueItem.position,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });
      });

      return nextQueueItem.songs;
    }
  );

  // Get the current user's full queue
  server.get(
    "/api/queue",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const userId = request.session.get("userId");

      if (userId === undefined) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      const queue = await prisma.user_queue.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          songs: {
            include: {
              artists: true,
              albums: true,
            },
          },
        },
      });

      return queue;
    }
  );

  // Remove a song from the current user's queue
  server.delete(
    "/api/queue/:id",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const userId = request.session.get("userId");

      if (userId === undefined) {
        return reply.code(401).send({
          error: "Not authenticated",
        });
      }

      const { id } = request.params as {
        id: string;
      };

      const queueItemId = Number(id);

      if (!Number.isInteger(queueItemId)) {
        return reply.code(400).send({
          error: "Invalid queue item ID",
        });
      }

      const queueItem = await prisma.user_queue.findFirst({
        where: {
          id: queueItemId,
          user_id: userId,
        },
      });

      if (!queueItem) {
        return reply.code(404).send({
          error: "Queue item not found",
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.user_queue.delete({
          where: {
            id: queueItem.id,
          },
        });

        await tx.user_queue.updateMany({
          where: {
            user_id: userId,
            position: {
              gt: queueItem.position,
            },
          },
          data: {
            position: {
              decrement: 1,
            },
          },
        });
      });

      return {
        success: true,
      };
    }
  );
}