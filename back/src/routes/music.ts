import { FastifyInstance } from "fastify";
import { importMusic } from "../../scripts/import-music.js";
import { updateAlbumCovers } from "../../scripts/updateAlbumCovers.js";
import { authenticate } from "../hooks/auth.js";


const MUSIC_IMPORT_USER_ID = 1;


//Used to run the import script
export async function musicRoutes(server: FastifyInstance) {
  server.addHook("preHandler", authenticate);
  server.post("/api/music/import", async (request, reply) => {
    const userId = request.session.get("userId");

    if (userId !== MUSIC_IMPORT_USER_ID) {
      return reply.code(403).send({
        success: false,
        error: "Forbidden",
      });
    }




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