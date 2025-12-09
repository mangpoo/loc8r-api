const express = require('express');
const router = express.Router();
// [추가] express-jwt 모듈 가져오기 (최신 버전은 구조분해할당 필요)
const { expressjwt: jwt } = require('express-jwt');

// [추가] 인증 미들웨어 설정
// 1. secret: .env 파일의 JWT_SECRET 사용
// 2. algorithms: 보안 알고리즘 명시 (필수)
// 3. requestProperty: JWT 페이로드를 req.payload에 저장 (기본값은 req.auth)
const auth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload' 
});

const ctrlLocations = require('../controllers/locations');
const ctrlReviews = require('../controllers/reviews');
const ctrlAuth = require('../controllers/authentication');

// locations
router
  .route('/locations')
  .get(ctrlLocations.locationsListByDistance)
  .post(ctrlLocations.locationsCreate);

router
  .route('/locations/:locationid')
  .get(ctrlLocations.locationsReadOne)
  .put(ctrlLocations.locationsUpdateOne)
  .delete(ctrlLocations.locationsDeleteOne);

// reviews
router
  .route('/locations/:locationid/reviews')
  .post(auth, ctrlReviews.reviewsCreate); // [변경] auth 미들웨어 추가 (로그인한 사람만 리뷰 작성 가능)

router
  .route('/locations/:locationid/reviews/:reviewid')
  .get(ctrlReviews.reviewsReadOne)
  .put(ctrlReviews.reviewsUpdateOne)
  .delete(ctrlReviews.reviewsDeleteOne);

// Authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;