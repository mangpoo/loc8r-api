const mongoose = require('mongoose');

// 1. 영업 시간 스키마 (서브 다큐먼트)
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

// 2. 리뷰 스키마 (서브 다큐먼트)
const reviewSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  reviewText: {
    type: String,
    required: true
  },
  createdOn: {
    type: Date,
    'default': Date.now
  }
});

// 3. 메인 장소(Location) 스키마
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
  // GeoJSON 좌표 (경도, 위도 순서 주의!)
  coords: {
    type: { type: String },
    coordinates: [Number]
  },
  openingTimes: [openingTimeSchema],
  reviews: [reviewSchema]
});

// 좌표 인덱스 설정 (2dsphere) - 거리 계산을 위해 필수
locationSchema.index({ coords: '2dsphere' });

// 모델 등록
mongoose.model('Location', locationSchema);