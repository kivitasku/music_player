import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { prisma } from "../src/lib/prisma.js";

const musicDirectoryEnv = process.env.MUSIC_RES;

if (!musicDirectoryEnv) {
  throw new Error("MUSIC_RES environment variable is not set");
}

const musicDirectory = path.resolve(musicDirectoryEnv);

const preferredCoverNames = [
  "cover.jpg",
  "cover.jpeg",
  "cover.png",
  "cover.webp",
  "folder.jpg",
  "folder.jpeg",
  "folder.png",
  "folder.webp",
  "front.jpg",
  "front.jpeg",
  "front.png",
  "front.webp",
  "album.jpg",
  "album.jpeg",
  "album.png",
  "album.webp",
];

const imageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

export async function updateAlbumCovers() {
  console.log("Starting album cover update...\n");

  const albums = await prisma.albums.findMany({
    include: {
      songs: {
        orderBy: {
          track_no: "asc",
        },
        take: 1,
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log(`Found ${albums.length} albums.\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const album of albums) {
    // Don't overwrite an existing cover
    if (album.cover_path) {
      console.log(
        `[SKIP] ${album.title} - already has cover`
      );

      skipped++;
      continue;
    }

    const firstSong = album.songs[0];

    if (!firstSong) {
      console.log(
        `[SKIP] ${album.title} - no songs found`
      );

      skipped++;
      continue;
    }

    const relativeSongPath = firstSong.file_path.replace(
      /^\/music\//,
      ""
    );

    const absoluteSongPath = path.join(
      musicDirectory,
      relativeSongPath
    );

    const albumDirectory = path.dirname(
      absoluteSongPath
    );

    // Debug information
    console.log("Album:", album.title);
    console.log("Song path:", firstSong.file_path);
    console.log("Album directory:", albumDirectory);
    console.log(
      "Directory exists:",
      fs.existsSync(albumDirectory)
    );
    console.log("--------------------");

    if (!fs.existsSync(albumDirectory)) {
      console.log(
        `[NOT FOUND] ${album.title} - directory does not exist: ${albumDirectory}`
      );

      notFound++;
      continue;
    }

    const files = fs.readdirSync(albumDirectory);

    // First look for preferred filenames
    let coverFile: string | undefined;

    for (const preferredName of preferredCoverNames) {
      const match = files.find(
        (file) => file.toLowerCase() === preferredName
      );

      if (match) {
        coverFile = match;
        break;
      }
    }

    // If no preferred cover was found,
    // use the first image file
    if (!coverFile) {
      coverFile = files.find((file) =>
        imageExtensions.includes(
          path.extname(file).toLowerCase()
        )
      );
    }

    if (!coverFile) {
      console.log(
        `[NO COVER] ${album.title}`
      );

      notFound++;
      continue;
    }

    const coverPath = `/music/${path
      .relative(
        musicDirectory,
        path.join(albumDirectory, coverFile)
      )
      .split(path.sep)
      .join("/")}`;

    await prisma.albums.update({
      where: {
        id: album.id,
      },
      data: {
        cover_path: coverPath,
      },
    });

    console.log(
      `[UPDATED] ${album.title} -> ${coverPath}`
    );

    updated++;
  }

  console.log("\n----------------------------");
  console.log("Album cover update complete!");
  console.log(`Updated:   ${updated}`);
  console.log(`Skipped:   ${skipped}`);
  console.log(`No cover:  ${notFound}`);
  console.log("----------------------------");
}