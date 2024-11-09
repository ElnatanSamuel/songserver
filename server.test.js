const request = require("supertest");
const mongoose = require("mongoose");
const { app, MONGODB_URI } = require("./server");
const Song = require("./models/Song");

describe("Song API", () => {
  // Connect to test database before all tests
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  }, 10000);

  // Disconnect after all tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Clear the database before each test
  beforeEach(async () => {
    await Song.deleteMany({});
  });

  test("POST /api/songs - should create a new song", async () => {
    const songData = {
      title: "Test Song",
      artist: "Test Artist",
      album: "Test Album",
      genre: "Test Genre",
    };

    const response = await request(app).post("/api/songs").send(songData);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.title).toBe(songData.title);
    expect(response.body.artist).toBe(songData.artist);
    expect(response.body.album).toBe(songData.album);
    expect(response.body.genre).toBe(songData.genre);
  });

  test("POST /api/songs - should fail with invalid data", async () => {
    const invalidSongData = {
      title: "Test Song",
      // Missing required fields
    };

    const response = await request(app)
      .post("/api/songs")
      .send(invalidSongData);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Error creating song");
  });

  test("GET /api/songs - should get all songs", async () => {
    // First create some test songs
    const testSongs = [
      {
        title: "Test Song 1",
        artist: "Test Artist 1",
        album: "Test Album 1",
        genre: "Rock",
      },
      {
        title: "Test Song 2",
        artist: "Test Artist 2",
        album: "Test Album 2",
        genre: "Pop",
      },
    ];

    await Song.insertMany(testSongs);

    const response = await request(app).get("/api/songs");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(2);
  });

  test("GET /api/songs?genre=Rock - should filter songs by genre", async () => {
    // First create some test songs with different genres
    const testSongs = [
      {
        title: "Test Song 1",
        artist: "Test Artist 1",
        album: "Test Album 1",
        genre: "Rock",
      },
      {
        title: "Test Song 2",
        artist: "Test Artist 2",
        album: "Test Album 2",
        genre: "Pop",
      },
    ];

    await Song.insertMany(testSongs);

    const response = await request(app).get("/api/songs?genre=Rock");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(1);
    expect(response.body[0].genre).toBe("Rock");
  });

  test("PUT /api/songs/:id - should update a song", async () => {
    // First create a test song
    const song = await Song.create({
      title: "Original Song",
      artist: "Original Artist",
      album: "Original Album",
      genre: "Original Genre",
    });

    const updateData = {
      title: "Updated Song",
      artist: "Updated Artist",
    };

    const response = await request(app)
      .put(`/api/songs/${song._id}`)
      .send(updateData);

    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe(updateData.title);
    expect(response.body.artist).toBe(updateData.artist);
    // Original fields should remain unchanged
    expect(response.body.album).toBe("Original Album");
    expect(response.body.genre).toBe("Original Genre");
  });

  test("PUT /api/songs/:id - should fail with invalid ID", async () => {
    const invalidId = "invalid-id";
    const updateData = {
      title: "Updated Song",
    };

    const response = await request(app)
      .put(`/api/songs/${invalidId}`)
      .send(updateData);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Error updating song");
  });

  test("DELETE /api/songs/:id - should delete a song", async () => {
    // First create a test song
    const song = await Song.create({
      title: "Test Song",
      artist: "Test Artist",
      album: "Test Album",
      genre: "Test Genre",
    });

    const response = await request(app).delete(`/api/songs/${song._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Song deleted successfully");

    // Verify the song was actually deleted
    const deletedSong = await Song.findById(song._id);
    expect(deletedSong).toBeNull();
  });

  test("DELETE /api/songs/:id - should fail with invalid ID", async () => {
    const invalidId = "invalid-id";

    const response = await request(app).delete(`/api/songs/${invalidId}`);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "Error deleting song");
  });
});
