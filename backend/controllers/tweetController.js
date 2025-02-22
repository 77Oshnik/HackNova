const Tweet = require('../models/Tweet');

// Create Tweet
exports.createTweet = async (req, res) => {
    try {
        const { content } = req.body;
        let image = null;

        if (req.file) {
          // CORRECT: Use a path RELATIVE TO THE FRONTEND.
          image = `/uploads/${req.file.filename}`; // e.g., "/uploads/12345-image.jpg"
        }

        const newTweet = new Tweet({ content, image });
        await newTweet.save();
        res.status(201).json(newTweet);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: "Server error creating tweet." }); // More informative error message
    }
};

// Get Tweets with Filters and Sorting
exports.getTweets = async (req, res) => {
    try {
        const { filter } = req.query;
        let filterDate = new Date();

        // Filtering Logic
        switch (filter) {
            case 'week':
                filterDate.setDate(filterDate.getDate() - 7);
                break;
            case 'month':
                filterDate.setMonth(filterDate.getMonth() - 1);
                break;
            case 'year':
                filterDate.setFullYear(filterDate.getFullYear() - 1);
                break;
            default:
                filterDate.setHours(0, 0, 0, 0); // Today
        }
        // Use .lean() to convert the Mongoose documents to plain JavaScript
        const tweets = await Tweet.find({ createdAt: { $gte: filterDate } })
            .sort({ totalScore: -1, createdAt: -1 }).lean();

        res.status(200).json(tweets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching tweets." });
    }
};

// Upvote/Downvote Tweet
exports.voteTweet = async (req, res) => {
    try {
        const { id, type } = req.params;

        // Find the tweet *and* update it in one operation (more efficient)
        const tweet = await Tweet.findById(id); //find tweet
        if(!tweet) {                       //if not present
            return res.status(404).json({ message: 'Tweet not found' });
        }

        if (type === 'upvote') {
            tweet.upvotes += 1;
        } else if (type === 'downvote') {
            tweet.downvotes += 1;
        } else {
            return res.status(400).json({ message: 'Invalid vote type' }); // Prevent bad requests
        }
         tweet.totalScore = tweet.upvotes - tweet.downvotes;
         await tweet.save();       //save tweet

        // Return the *updated* tweet.  Important for the frontend to update its state.
        res.status(200).json(tweet);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error voting on tweet." });
    }
};

