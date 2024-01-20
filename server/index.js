const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

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

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
