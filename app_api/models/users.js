const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // [추가] JWT 라이브러리 임포트

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hash: String,
  salt: String
});

userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  return this.hash === hash;
};

// [추가] JWT 생성 메소드
userSchema.methods.generateJwt = function() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // 만료 기간 7일 설정

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000), // 유닉스 타임스탬프(초 단위)로 변환
  }, process.env.JWT_SECRET); // 환경 변수에서 시크릿 키 가져오기
};

mongoose.model('User', userSchema);