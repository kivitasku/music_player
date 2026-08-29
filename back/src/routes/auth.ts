import type { FastifyInstance } from "fastify";
import argon2 from "argon2";

import { prisma } from "../lib/prisma.js";
import { authenticate } from "../hooks/auth.js";


const registerOpen = true; // Set to false to disable registration

export async function authRoutes(
  server: FastifyInstance
) {
  //register
  server.post("/api/auth/register", async (request, reply) => {
    
    if (!registerOpen) {
      return reply.code(400).send({
        error: "Registration is currently closed",
      });
    }

    console.log("Register request body:", request.body);
    const { username, password } = request.body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return reply.code(400).send({
        error: "Username and password are required",
      });
    }

    if (username.length < 3 || username.length > 50) {
      return reply.code(400).send({
        error: "Username must be between 3 and 50 characters",
      });
    }

    if (password.length < 8) {
      return reply.code(400).send({
        error: "Password must be at least 8 characters",
      });
    }

    const existingUser = await prisma.users.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return reply.code(409).send({
        error: "Username already exists",
      });
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await prisma.users.create({
      data: {
        username,
        password_hash: passwordHash,
      },
    });

    request.session.set("userId", user.id);

    return reply.code(201).send({
      id: user.id,
      username: user.username,
    });
  });


  //login
  server.post("/api/auth/login", async (request, reply) => {
  const { username, password } = request.body as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return reply.code(400).send({
      error: "Username and password are required",
    });
  }

  const user = await prisma.users.findUnique({
    where: {
      username,
    },
  });

  // Don't reveal whether the username exists
  if (!user) {
    return reply.code(401).send({
      error: "Invalid username or password",
    });
  }

  const passwordValid = await argon2.verify(
    user.password_hash,
    password
  );

  if (!passwordValid) {
    return reply.code(401).send({
      error: "Invalid username or password",
    });
  }

  // Store the user's ID in the session
  request.session.set("userId", user.id);

  return reply.send({
    id: user.id,
    username: user.username,
  });
});


  //logout
server.post(
  "/api/auth/logout",
  {
    preHandler: authenticate,
  },
  async (request, reply) => {
    await request.session.delete();

    reply.send({ message: "Logged out successfully" });
    return {
      success: true,
    };
  }
);

  //me endpoint to get the current logged-in user
  server.get("/api/auth/me", async (request, reply) => {
  const userId = request.session.get("userId");

  if (userId === undefined) {
    return reply.code(401).send({
      error: "Not authenticated",
    });
  }

  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      songs: {
        include: {
          artists: true,
          albums: true,
        },
      },
    },
  });

  if (!user) {
    request.session.delete();

    return reply.code(401).send({
      error: "User not found",
    });
  }

  return user;
});


//recent-albums endpoint to get the recent albums for the current logged-in user
server.get(
  "/api/auth/recent-albums",
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

    const recentAlbums =
      await prisma.user_recent_albums.findMany({
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

    return recentAlbums.map((entry) => entry.albums);
  }
);



}