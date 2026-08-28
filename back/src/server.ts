import "dotenv/config";

import Fastify from "fastify";
import fs from "node:fs";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "node:path";

import fastifySecureSession from "@fastify/secure-session";

import { songRoutes } from "./routes/songs.js";
import { artistRoutes } from "./routes/artists.js";
import { albumRoutes } from "./routes/albums.js";
import { musicRoutes } from "./routes/music.js";
import { authRoutes } from "./routes/auth.js";
import { playbackRoutes } from "./routes/playback.js";

const server = Fastify({
  logger: true
});


server.register(fastifySecureSession, {
  key: fs.readFileSync(
    path.join(process.cwd(), "secret-key")
  ),
  cookie: {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
});


server.register(cors, {
  origin: "http://localhost:5173",
  credentials: true,
});

const musicDirectoryEnv = process.env.MUSIC_RES;

if (!musicDirectoryEnv) {
  throw new Error("MUSIC_RES environment variable is not set");
}

const musicDirectory = path.resolve(musicDirectoryEnv);


server.register(fastifyStatic, {
  root: musicDirectory,
  prefix: "/music/",

  allowedPath: (_pathName, _root, request) => {
    const userId = request.session.get("userId");

    return userId !== undefined;
  },
});



server.register(authRoutes);
server.register(songRoutes);
server.register(artistRoutes);
server.register(albumRoutes);
server.register(musicRoutes);
server.register(playbackRoutes);


server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }

  console.log(`Server running at ${address}`);
});