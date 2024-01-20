const express = require('express');
const app = express();
const port = 3000;

const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer configuration
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Color-blind simulation endpoint with file upload
app.post('/simulate-color-blind/:condition', upload.single('image'), async (req, res) => {
  try {
    const { condition } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    // Upload the image file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.buffer, {
      public_id: `uploads/${Date.now()}`, // Use a unique public_id
    });

    // Construct Cloudinary transformation URL for color-blind simulation
    const transformedImageUrl = cloudinary.url(uploadResult.public_id, {
      transformation: [
        { effect: 'simulate_colorblind', gravity: 'center', colorblindness: condition },
      ],
    });

    return res.json({ simulatedImageUrl: transformedImageUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
