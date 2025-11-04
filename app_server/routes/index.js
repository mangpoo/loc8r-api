const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/locations');
const ctrlOthers = require('../controllers/others');

/* Other pages */
router.get('/about', ctrlOthers.about);

/* Locations pages */
router.get('/', ctrlLocations.homelist);
router.get('/location/:locationid', ctrlLocations.locationInfo); // 개별 location 정보

// 'Add review' GET/POST 라우트 (locationid 파라미터 포함)
router
  .route('/location/:locationid/review/new')
  .get(ctrlLocations.addReview)
  .post(ctrlLocations.doAddReview); // (doAddReview는 다음 단계를 위해 추가)

module.exports = router;