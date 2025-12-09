require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors'); // CORS 모듈 import

// [변경] Passport 모듈 require
const passport = require('passport'); 

// DB 모델 연결
require('./app_api/models/db');
// [변경] DB 모델 바로 뒤에 Passport 설정 파일 연결 (순서 중요!)
require('./app_api/config/passport'); 

const apiRouter = require('./app_api/routes/index');

const app = express();
// [수정] Render에서 제공하는 PORT 환경 변수를 사용하도록 변경
const port = process.env.PORT || 3000; 

// 뷰 엔진 설정 (사용하지 않지만 유지)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'app_server', 'views'));

// 기본 미들웨어 설정
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// [1] 백엔드용 정적 파일
app.use(express.static(path.join(__dirname, 'public')));

// [2] 프론트엔드용 정적 파일 (Angular 빌드 파일)
// Render 배포 시에는 API 서버와 프론트엔드를 분리 배포하는 것이 일반적이므로, 
// 이 경로는 Render에 Angular 정적 파일을 직접 올리지 않을 경우 제거해야 합니다.
// 하지만 현재 코드는 API 서버가 Angular 파일을 제공하는 구조이므로, 경로를 유지하되 배포 환경에 맞게 조정합니다.
app.use(express.static(path.join(__dirname, '..', 'app_public', 'dist', 'loc8r-public', 'browser')));


// [3] CORS 설정 (업데이트)
// [수정] Render 환경에서는 특정 오리진 대신 와일드카드 '*' 또는 Render 프론트엔드 URL을 사용해야 합니다.
// 프론트엔드가 같은 Render 계정에 배포되었다면, 'https://[프론트엔드-서비스-이름].onrender.com'으로 변경하거나
// 임시로 와일드카드 '*'를 사용하여 테스트합니다.
app.use('/api', (req, res, next) => {
  // [수정] 오리진을 와일드카드 '*'로 변경 (개발 단계에서는 편리, 보안상 권장되지는 않음)
  // 배포 완료 후에는 'https://[당신의-프론트엔드-주소].onrender.com'으로 변경해야 합니다.
  res.header('Access-Control-Allow-Origin', '*'); 
  // [변경] Authorization 헤더 유지
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// [변경] [4] API 라우트 전에 Passport 초기화
app.use(passport.initialize());

// [4] API 라우트
app.use('/api', apiRouter);

// [5] Angular Deep URL 처리
// [수정] 경로를 API 서버가 아닌, Angular의 index.html 경로로 수정
app.get(/^(?!.*\/api).*$/, function(req, res) { 
  res.sendFile(path.join(__dirname, '..', 'app_public', 'dist', 'loc8r-public', 'browser', 'index.html'));
});

// 404 에러 처리
app.use(function(req, res, next) {
  next(createError(404));
});

// 에러 핸들러
app.use(function(err, req, res, next) {
  // 에러 발생 시 Unauthorized(401) 인 경우 처리 유지
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({"message" : err.name + ": " + err.message});
  }
  
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 포트 ${port} 에서 실행 중입니다.`);
});

module.exports = app;