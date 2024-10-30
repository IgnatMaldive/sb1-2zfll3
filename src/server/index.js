import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Sample music data
const tracks = [
  {
    id: 1,
    title: "La Cumparsita",
    artist: "Carlos Gardel",
    duration: 180,
    cover: "https://images.unsplash.com/photo-1632670549175-154d5a33f1e7?w=300&h=300&fit=crop",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav" // Sample audio file
  },
  {
    id: 2,
    title: "El Choclo",
    artist: "Ángel Villoldo",
    duration: 195,
    cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
    audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/ImperialMarch60.wav"
  }
];

app.get('/api/tracks', (req, res) => {
  res.json(tracks);
});

app.get('/api/tracks/:id', (req, res) => {
  const track = tracks.find(t => t.id === parseInt(req.params.id));
  if (track) {
    res.json(track);
  } else {
    res.status(404).json({ error: 'Track not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});