import type { FastifyInstance } from "fastify";

import { prisma } from "../lib/prisma.js";

import { authenticate } from "../hooks/auth.js";

export async function searchRoutes(server: FastifyInstance) {
  server.get(
    "/api/search",
    { preHandler: authenticate },
    async (request, reply) => {
      const { q, type, limit = "5", offset = "0" } = request.query as {
        q?: string;
        type?: "artists" | "albums" | "songs";
        limit?: string;
        offset?: string;
      };

      if (!q || !q.trim()) {
        return reply.code(400).send({
          error: "Search query is required",
        });
      }

      if (
        type !== undefined &&
        type !== "artists" &&
        type !== "albums" &&
        type !== "songs"
      ) {
        return reply.code(400).send({
          error: "Invalid search type",
        });
      }

      const query = q.trim();

      const parsedLimit = Math.min(Number(limit), 50);
      const parsedOffset = Number(offset);

      if (
        !Number.isInteger(parsedLimit) ||
        !Number.isInteger(parsedOffset) ||
        parsedLimit < 1 ||
        parsedOffset < 0
      ) {
        return reply.code(400).send({
          error: "Invalid pagination parameters",
        });
      }

      // Initial search: return the first page of all categories
      if (!type) {
        const [artists, albums, songs] = await Promise.all([
          prisma.artists.findMany({
            where: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            orderBy: {
              name: "asc",
            },
            skip: 0,
            take: parsedLimit + 1,
          }),

          prisma.albums.findMany({
            where: {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            include: {
              artists: true,
            },
            orderBy: {
              title: "asc",
            },
            skip: 0,
            take: parsedLimit + 1,
          }),

          prisma.songs.findMany({
            where: {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            include: {
              artists: true,
              albums: true,
            },
            orderBy: {
              title: "asc",
            },
            skip: 0,
            take: parsedLimit + 1,
          }),
        ]);

        const hasMoreArtists = artists.length > parsedLimit;
        const hasMoreAlbums = albums.length > parsedLimit;
        const hasMoreSongs = songs.length > parsedLimit;

        return {
          artists: artists.slice(0, parsedLimit),
          albums: albums.slice(0, parsedLimit),
          songs: songs.slice(0, parsedLimit),

          hasMoreArtists,
          hasMoreAlbums,
          hasMoreSongs,
        };
      }

      // Show more artists
      if (type === "artists") {
        const artists = await prisma.artists.findMany({
          where: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          orderBy: {
            name: "asc",
          },
          skip: parsedOffset,
          take: parsedLimit + 1,
        });

        const hasMoreArtists = artists.length > parsedLimit;

        return {
          artists: artists.slice(0, parsedLimit),
          albums: [],
          songs: [],

          hasMoreArtists,
          hasMoreAlbums: false,
          hasMoreSongs: false,
        };
      }

      // Show more albums
      if (type === "albums") {
        const albums = await prisma.albums.findMany({
          where: {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          include: {
            artists: true,
          },
          orderBy: {
            title: "asc",
          },
          skip: parsedOffset,
          take: parsedLimit + 1,
        });

        const hasMoreAlbums = albums.length > parsedLimit;

        return {
          artists: [],
          albums: albums.slice(0, parsedLimit),
          songs: [],

          hasMoreAlbums,
          hasMoreArtists: false,
          hasMoreSongs: false,
        };
      }

      // Show more songs
      const songs = await prisma.songs.findMany({
        where: {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
        include: {
          artists: true,
          albums: true,
        },
        orderBy: {
          title: "asc",
        },
        skip: parsedOffset,
        take: parsedLimit + 1,
      });

      const hasMoreSongs = songs.length > parsedLimit;

      return {
        artists: [],
        albums: [],
        songs: songs.slice(0, parsedLimit),

        hasMoreSongs,
        hasMoreArtists: false,
        hasMoreAlbums: false,
      };
    }
  );
}
