const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const multer = require('multer');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store files in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Generate a unique filename.  Date.now() + original name is good enough for this example.
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes

// Create a new tweet (with optional image)
router.post('/tweets', upload.single('image'), tweetController.createTweet);

// Get tweets (with filtering and sorting)
router.get('/tweets', tweetController.getTweets);

// Upvote or downvote a tweet
router.put('/tweets/:id/:type', tweetController.voteTweet);

module.exports = router;

