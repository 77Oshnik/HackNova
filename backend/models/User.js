const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    default: () => uuidv4(), // Generates a unique identifier using UUID v4
    immutable: true // Once set, cannot be changed
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required:true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
