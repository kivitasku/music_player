import "dotenv/config";

import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "node:path";

import { songRoutes } from "./routes/songs.js";
import { artistRoutes } from "./routes/artists.js";
import { albumRoutes } from "./routes/albums.js";
import { musicRoutes } from "./routes/music.js";

const server = Fastify({
  logger: true
});

const musicDirectoryEnv = process.env.MUSIC_RES;

if (!musicDirectoryEnv) {
  throw new Error("MUSIC_RES environment variable is not set");
}

const musicDirectory = path.resolve(musicDirectoryEnv);

server.register(cors, {
  origin: "http://localhost:5173"
});

server.register(fastifyStatic, {
  root: path.resolve(musicDirectory),
  prefix: "/music/",
});



server.register(songRoutes);
server.register(artistRoutes);
server.register(albumRoutes);
server.register(musicRoutes);

server.listen({ port: 3000 }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }

  console.log(`Server running at ${address}`);
});