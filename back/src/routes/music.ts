import { FastifyInstance } from "fastify";
import { importMusic } from "../../scripts/import-music.js";
import { updateAlbumCovers } from "../../scripts/updateAlbumCovers.js";
import { authenticate } from "../hooks/auth.js";

//Used to run the import script
export async function musicRoutes(server: FastifyInstance) {
  server.addHook("preHandler", authenticate);
  server.post("/api/music/import", async (_request, reply) => {
    try {
      
      
      const result = await importMusic();
      await updateAlbumCovers();

      return {
        success: true,
        ...result
      };
      

    } catch (error) {
      server.log.error(error);

      return reply.code(500).send({
        success: false,
        error: "Music import failed"
      });
    }
  });
}