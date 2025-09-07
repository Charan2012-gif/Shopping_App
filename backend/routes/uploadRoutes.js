import express from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/errorHandler.js';
import { dummyAuth } from '../middleware/auth.js';
import { uploadToS3, deleteFromS3, generateS3Key } from '../config/aws.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload single image
router.post('/single', dummyAuth, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  const { type, name, color } = req.body;
  const filename = `${Date.now()}-${req.file.originalname}`;
  const key = generateS3Key(type, name, color, filename);
  
  try {
    const imageUrl = await uploadToS3(req.file, key);
    
    res.json({
      success: true,
      data: {
        url: imageUrl,
        key,
        filename: req.file.originalname
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

// Upload multiple images
router.post('/multiple', dummyAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  
  const { type, name, color } = req.body;
  const uploadPromises = [];
  
  for (const file of req.files) {
    const filename = `${Date.now()}-${file.originalname}`;
    const key = generateS3Key(type, name, color, filename);
    uploadPromises.push(uploadToS3(file, key));
  }
  
  try {
    const imageUrls = await Promise.all(uploadPromises);
    
    res.json({
      success: true,
      data: imageUrls.map((url, index) => ({
        url,
        key: generateS3Key(type, name, color, `${Date.now()}-${req.files[index].originalname}`),
        filename: req.files[index].originalname
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

// Delete image
router.delete('/:key', dummyAuth, asyncHandler(async (req, res) => {
  const { key } = req.params;
  
  try {
    await deleteFromS3(decodeURIComponent(key));
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}));

export default router;