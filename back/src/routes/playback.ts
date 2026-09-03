import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";
import { authenticate } from "../hooks/auth.js";

const MAX_RECENT_ALBUMS = parseInt(process.env.MAX_RECENT_ALBUMS || "8");

interface PlaybackRequestBody {
  fromQueue?: boolean;
}

export async function playbackRoutes(server: FastifyInstance) {
  server.post<{
    Params: { songId: string };
    Body: PlaybackRequestBody;
  }>(
    "/api/playback/:songId",
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

      const songId = Number(request.params.songId);

      if (Number.isNaN(songId)) {
        return reply.code(400).send({
          error: "Invalid song ID",
        });
      }

      const fromQueue = request.body?.fromQueue ?? false;

      const song = await prisma.songs.findUnique({
        where: {
          id: songId,
        },
        select: {
          id: true,
          album_id: true,
        },
      });

      if (!song) {
        return reply.code(404).send({
          error: "Song not found",
        });
      }

      const recentAlbums = await prisma.$transaction(async (tx) => {
        /*
         * 1. Always save the song that is currently playing.
         *
         * This means queued songs also become last_played_song_id.
         */
        await tx.users.update({
          where: {
            id: userId,
          },
          data: {
            last_played_song_id: song.id,
          },
        });

        /*
         * 2. If this song came from the queue, DO NOT change
         *    playback_album_id or playback_album_song_id.
         *
         * The album playback context must survive queued songs.
         */
        if (!fromQueue && song.album_id !== null) {
          await tx.users.update({
            where: {
              id: userId,
            },
            data: {
              playback_album_id: song.album_id,
              playback_album_song_id: song.id,
            },
          });
        }

        /*
         * A song doesn't have to belong to an album.
         */
        if (song.album_id === null) {
          return [];
        }

        /*
         * 3. Get current recent albums.
         */
        const currentRecentAlbums =
          await tx.user_recent_albums.findMany({
            where: {
              user_id: userId,
            },
            orderBy: {
              position: "asc",
            },
          });

        /*
         * 4. Remove the played album from its old position.
         */
        const remainingAlbums = currentRecentAlbums.filter(
          (album) => album.album_id !== song.album_id
        );

        /*
         * 5. Move everything temporarily so that position 1
         *    can safely be assigned.
         */
        for (let i = 0; i < currentRecentAlbums.length; i++) {
          await tx.user_recent_albums.update({
            where: {
              id: currentRecentAlbums[i].id,
            },
            data: {
              position: 100 + i,
            },
          });
        }

        /*
         * 6. Put the played album at position 1.
         */
        const playedAlbum = currentRecentAlbums.find(
          (album) => album.album_id === song.album_id
        );

        if (playedAlbum) {
          await tx.user_recent_albums.update({
            where: {
              id: playedAlbum.id,
            },
            data: {
              position: 1,
            },
          });
        } else {
          await tx.user_recent_albums.create({
            data: {
              user_id: userId,
              album_id: song.album_id,
              position: 1,
            },
          });
        }

        /*
         * 7. Put the remaining albums at positions 2-8.
         */
        const albumsToKeep = remainingAlbums.slice(
          0,
          MAX_RECENT_ALBUMS - 1
        );

        for (let i = 0; i < albumsToKeep.length; i++) {
          await tx.user_recent_albums.update({
            where: {
              id: albumsToKeep[i].id,
            },
            data: {
              position: i + 2,
            },
          });
        }

        /*
         * 8. Delete anything outside the maximum.
         */
        await tx.user_recent_albums.deleteMany({
          where: {
            user_id: userId,
            position: {
              gt: MAX_RECENT_ALBUMS,
            },
          },
        });

        /*
         * 9. Return the final recent albums.
         */
        return tx.user_recent_albums.findMany({
          where: {
            user_id: userId,
          },
          orderBy: {
            position: "asc",
          },
          include: {
            albums: {
              include: {
                artists: true,
              },
            },
          },
        });
      });

      return {
        recentAlbums: recentAlbums.map(
          (entry) => entry.albums
        ),
      };
    }
  );
}