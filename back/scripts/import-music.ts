
import fs from "node:fs/promises";
import path from "node:path";

import { parseFile } from "music-metadata";
import type { IAudioMetadata } from "music-metadata";

import { prisma } from "../src/lib/prisma.js";


const musicDir = process.env.MUSIC_RES;

if (!musicDir) {
  throw new Error("MUSIC_RES environment variable is not set");
}


const musicDirectory = path.resolve(musicDir);


function getYear(metadata: IAudioMetadata): number | undefined {
  if (metadata.common.year !== undefined) {
    return metadata.common.year;
  }

  const nativeYear = metadata.native.vorbis?.find(
    (tag) => tag.id.toUpperCase() === "YEAR"
  )?.value;

  if (nativeYear === undefined) {
    return undefined;
  }

  const year = Number(nativeYear);

  return Number.isNaN(year) ? undefined : year;
}


async function findAudioFiles(
  directory: string
): Promise<string[]> {
  const entries = await fs.readdir(directory, {
    withFileTypes: true
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      files.push(
        ...(await findAudioFiles(fullPath))
      );
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path
      .extname(entry.name)
      .toLowerCase();

    if (
      extension === ".flac" ||
      extension === ".mp3"
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

export async function importMusic() {
  console.log("Scanning music directory...");

  const files = await findAudioFiles(
    musicDirectory
  );

  console.log(
    `Found ${files.length} audio files.`
  );

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    console.log(
      `\nProcessing: ${file}`
    );

    try {
      const metadata = await parseFile(file);

      const title = metadata.common.title;
      const artistName = metadata.common.artist;
      const albumTitle = metadata.common.album;
      const year = getYear(metadata);
      const trackNo = metadata.common.track.no;

      if (!title) {
        console.log(
          "Skipped: missing title"
        );

        skipped++;
        continue;
      }

      if (!artistName) {
        console.log(
          "Skipped: missing artist"
        );

        skipped++;
        continue;
      }

      // Find existing artist
      let artist = await prisma.artists.findFirst({
        where: {
          name: artistName
        }
      });

      // Create artist if it doesn't exist
      if (!artist) {
        artist = await prisma.artists.create({
          data: {
            name: artistName
          }
        });

        console.log(
          `Created artist: ${artistName}`
        );
      }

      // Find/create album
      let album = null;

      if (albumTitle) {
        album = await prisma.albums.findFirst({
          where: {
            title: albumTitle,
            artist_id: artist.id
          }
        });

        if (!album) {
          album = await prisma.albums.create({
            data: {
              title: albumTitle,
              artist_id: artist.id,
              year: year ?? null
            }
          });

          console.log(
            `Created album: ${albumTitle}`
          );
        } else if (album.year === null && year !== undefined) {
          album = await prisma.albums.update({
            where: {
              id: album.id
            },
            data: {
              year
            }
          });

          console.log(
            `Added year ${year} to album: ${albumTitle}`
          );
        }
      }

      // Create path used by the API
      const relativePath = path.relative(
        musicDirectory,
        file
      );

      const filePath =
        "/music/" +
        relativePath
          .split(path.sep)
          .map(encodeURIComponent)
          .join("/");

      // Check whether this file is already imported
      const existingSong =
        await prisma.songs.findFirst({
          where: {
            file_path: filePath
          }
        });

      if (existingSong) {
        console.log(
          `Already imported: ${title}`
        );

        skipped++;
        continue;
      }

      // Create song
      await prisma.songs.create({
        data: {
          title,
          artist_id: artist.id,
          album_id: album?.id ?? null,
          file_path: filePath,
          track_no: trackNo ?? null
        }
      });

      console.log(
        `Imported: ${title} - ${artistName}`
      );

      imported++;
    } catch (error) {
      console.error(
        `Failed to import: ${file}`
      );

      console.error(error);

      failed++;
    }
  }

  console.log("\nImport complete.");
  console.log(`Found:    ${files.length}`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Failed:   ${failed}`);

  return {
    found: files.length,
    imported,
    skipped,
    failed
  };
}