const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateWithToken } = require('../middleware/auth');
const BrewStyle = require('../models/BrewStyle');
const logger = require('../utils/log');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/recipes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

// Get all brew styles
router.get('/', async (req, res) => {
  try {
    logger.debug('Fetching all brew styles');
    const brewStyles = await BrewStyle.find();
    logger.debug('Found brew styles:', brewStyles);
    res.json(brewStyles);
  } catch (error) {
    logger.error('Error fetching brew styles:', error);
    res.status(500).json({ error: 'Error fetching brew styles' });
  }
});

// Create new brew style
router.post('/', async (req, res) => {
  try {
    logger.debug('Received brew style data:', req.body);
    const brewStyle = new BrewStyle(req.body);
    logger.debug('Attempting to save brew style');
    const savedStyle = await brewStyle.save();
    logger.debug('Brew style saved successfully:', savedStyle);
    res.status(201).json(savedStyle);
  } catch (error) {
    logger.error('Error creating brew style:', error);
    res.status(500).json({ error: 'Error creating brew style' });
  }
});

// Upload recipe document
router.post('/:id/recipe-document', upload.single('recipeDocument'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const brewStyle = await BrewStyle.findById(req.params.id);
    if (!brewStyle) {
      return res.status(404).json({ error: 'Brew style not found' });
    }

    // Delete old file if it exists
    if (brewStyle.recipeDocument?.fileUrl) {
      const oldFilePath = path.join(__dirname, '..', brewStyle.recipeDocument.fileUrl);
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        logger.error('Error deleting old file:', error);
      }
    }

    const fileUrl = `/uploads/recipes/${req.file.filename}`;
    brewStyle.recipeDocument = {
      fileName: req.file.originalname,
      fileType: path.extname(req.file.originalname).substring(1),
      fileUrl: fileUrl,
      uploadedAt: new Date()
    };

    await brewStyle.save();
    res.json(brewStyle);
  } catch (error) {
    logger.error('Error uploading recipe document:', error);
    res.status(500).json({ error: 'Error uploading recipe document' });
  }
});

// Delete recipe document
router.delete('/:id/recipe-document', async (req, res) => {
  try {
    const brewStyle = await BrewStyle.findById(req.params.id);
    if (!brewStyle) {
      return res.status(404).json({ error: 'Brew style not found' });
    }

    if (brewStyle.recipeDocument?.fileUrl) {
      const filePath = path.join(__dirname, '..', brewStyle.recipeDocument.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        logger.error('Error deleting file:', error);
      }
    }

    brewStyle.recipeDocument = undefined;
    await brewStyle.save();
    res.json(brewStyle);
  } catch (error) {
    logger.error('Error deleting recipe document:', error);
    res.status(500).json({ error: 'Error deleting recipe document' });
  }
});

module.exports = router; 