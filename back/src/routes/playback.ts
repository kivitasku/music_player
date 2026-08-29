import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";

import { authenticate } from "../hooks/auth.js";


const MAX_RECENT_ALBUMS = 8;


export async function playbackRoutes(
  server: FastifyInstance
) {
  server.post<{ Params: { songId: string } }>(
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


  // 1. Save last played song

  await tx.users.update({
    where: {
      id: userId,
    },
    data: {
      last_played_song_id: song.id,
    },
  });

  // A song doesn't have to belong to an album
  if (song.album_id === null) {
    return [];
  }

  // 2. Get current recent albums

  const currentRecentAlbums =
    await tx.user_recent_albums.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        position: "asc",
      },
    });

  // 3. Remove the played album

  const remainingAlbums = currentRecentAlbums.filter(
    (album) => album.album_id !== song.album_id
  );

  // 4. Temporarily move everything

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

  // 5. Put played album at position 1

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

  // 6. Put remaining albums at 2-8

  const albumsToKeep = remainingAlbums.slice(0, MAX_RECENT_ALBUMS - 1);

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

  // 7. Delete albums outside the 8

  await tx.user_recent_albums.deleteMany({
    where: {
      user_id: userId,
      position: {
        gt: MAX_RECENT_ALBUMS,
      },
    },
  });

  // 8. Fetch the FINAL updated albums

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

// Return the transaction result to the frontend
return {
  recentAlbums: recentAlbums.map(
    (entry) => entry.albums
  ),
};
    }
  );
}
