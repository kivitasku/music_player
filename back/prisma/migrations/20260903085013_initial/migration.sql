-- CreateTable
CREATE TABLE "albums" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "year" INTEGER,
    "cover_path" VARCHAR(500),

    CONSTRAINT "albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artists" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "songs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "album_id" INTEGER,
    "file_path" TEXT NOT NULL,
    "track_no" INTEGER,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "last_played_song_id" INTEGER,
    "playback_album_id" INTEGER,
    "playback_album_song_id" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_queue" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "song_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "user_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_recent_albums" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "album_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "user_recent_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_playback" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "album_id" INTEGER,
    "song_id" INTEGER,

    CONSTRAINT "user_playback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "user_queue_user_id_position_idx" ON "user_queue"("user_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "user_queue_user_id_position_key" ON "user_queue"("user_id", "position");

-- CreateIndex
CREATE INDEX "user_recent_albums_user_id_position_idx" ON "user_recent_albums"("user_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "user_recent_albums_user_id_album_id_key" ON "user_recent_albums"("user_id", "album_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_recent_albums_user_id_position_key" ON "user_recent_albums"("user_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "user_playback_user_id_key" ON "user_playback"("user_id");

-- CreateIndex
CREATE INDEX "user_playback_user_id_idx" ON "user_playback"("user_id");

-- AddForeignKey
ALTER TABLE "albums" ADD CONSTRAINT "albums_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_last_played_song_id_fkey" FOREIGN KEY ("last_played_song_id") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_queue" ADD CONSTRAINT "user_queue_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_queue" ADD CONSTRAINT "user_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_recent_albums" ADD CONSTRAINT "user_recent_albums_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_recent_albums" ADD CONSTRAINT "user_recent_albums_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_playback" ADD CONSTRAINT "user_playback_album_fk" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_playback" ADD CONSTRAINT "user_playback_song_fk" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_playback" ADD CONSTRAINT "user_playback_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
