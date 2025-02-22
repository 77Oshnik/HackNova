const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,  //Removes leading/trailing whitespace
    maxlength: 280, // Twitter's character limit
  },
  image: {
    type: String, // Store the path to the image (or URL if using cloud storage)
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  totalScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  //Optionally include user information if you add user accounts later:
  // user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User', // Assuming you have a User model
  // }
});

module.exports = mongoose.model('Tweet', tweetSchema);
