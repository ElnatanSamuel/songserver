const express = require("express");
const Song = require("../models/Song");

const router = express.Router();

// Create a song
router.post("/", async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();
    res.status(201).json(song);
  } catch (error) {
    res.status(400).json({ message: "Error creating song", error });
  }
});

// Get all songs
router.get("/", async (req, res) => {
  try {
    const { genre } = req.query;
    let query = {};
    if (genre) {
      query = { genre: { $regex: new RegExp(genre, "i") } };
    }
    const songs = await Song.find(query);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching songs", error });
  }
});

// Update a song
router.put("/:id", async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(song);
  } catch (error) {
    res.status(400).json({ message: "Error updating song", error });
  }
});

// Delete a song
router.delete("/:id", async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: "Song deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error deleting song", error });
  }
});

// Get statistics
router.get("/stats", async (req, res) => {
  try {
    const totalSongs = await Song.countDocuments();
    const totalArtists = await Song.distinct("artist").countDocuments();
    const totalAlbums = await Song.distinct("album").countDocuments();
    const totalGenres = await Song.distinct("genre").countDocuments();

    const songsByGenre = await Song.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
    ]);

    const songsByArtist = await Song.aggregate([
      {
        $group: {
          _id: "$artist",
          songs: { $sum: 1 },
          albums: { $addToSet: "$album" },
        },
      },
      { $project: { songs: 1, albums: { $size: "$albums" } } },
    ]);

    const songsByAlbum = await Song.aggregate([
      { $group: { _id: "$album", count: { $sum: 1 } } },
    ]);

    res.json({
      totalSongs,
      totalArtists,
      totalAlbums,
      totalGenres,
      songsByGenre,
      songsByArtist,
      songsByAlbum,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics", error });
  }
});

module.exports = router;
