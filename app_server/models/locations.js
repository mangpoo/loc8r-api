const mongoose = require('mongoose');

// Define a schema for opening times
const openingTimeSchema = new mongoose.Schema({
  days: {
    type: String,
    required: true
  },
  opening: String,
  closing: String,
  closed: {
    type: Boolean,
    required: true
  }
});

// Define a schema for reviews
// [★★★★★ 수정된 부분 ★★★★★]
const reviewSchema = new mongoose.Schema({
  author: { // 'author'를 객체로 변경하고 required 추가
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  reviewText: { // 'reviewText'를 객체로 변경하고 required 추가
    type: String,
    required: true
  },
  createdOn: {
    type: Date,
    'default': Date.now
  }
});

// Define the main location schema
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: String,
  rating: {
    type: Number,
    'default': 0,
    min: 0,
    max: 5
  },
  facilities: [String],
  coords: {
    type: {
      type: String
    },
    coordinates: [Number]
  },
  openingTimes: [openingTimeSchema],
  reviews: [reviewSchema]
});

// Add 2dsphere index to coords
locationSchema.index({
  coords: '2dsphere'
});

// Compile schema into a model
mongoose.model('Location', locationSchema);