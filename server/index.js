const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { SpeechClient } = require('@google-cloud/speech');
require('dotenv').config();

process.env.GOOGLE_APPLICATION_CREDENTIALS="./groovy-height-404319-b1648a1b13c5.json";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.post('/simulate-color-blind/:condition', upload.single('image'), async (req, res) => {
  try {
    const { condition } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Cloudinary upload error' });
      }

      // Construct Cloudinary transformation URL for color-blind simulation
      const transformedImageUrl = cloudinary.url(result.public_id, {
        transformation: [
          { effect: 'simulate_colorblind', gravity: 'center', colorblindness: condition },
        ],
      });

      return res.json({ simulatedImageUrl: transformedImageUrl });
    });

    stream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const audioBuffer = req.file.buffer;
    const speechClient = new SpeechClient();

    const [response] = await speechClient.recognize({
      audio: {
        content: audioBuffer,
      },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
      },
    });

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.json({ text: transcription });
  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is listening on port ${process.env.PORT}`);
});
