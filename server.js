// [추가] .env 파일을 로드합니다. (반드시 최상단에 위치해야 합니다)
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('./app_server/models/db');

const app = express();
const port = 3000;

// 라우터 모듈 불러오기
const indexRouter = require('./app_server/routes/index');
// const usersRouter = require('./app_server/routes/users');
const apiRouter = require('./app_api/routes/index');

// 뷰 엔진 설정
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'app_server', 'views'));

// 미들웨어 설정
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 라우터 사용 설정
app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api', apiRouter);

// 404 에러 처리
app.use(function(req, res, next) {
  next(createError(404));
});

// 에러 핸들러
app.use(function(err, req, res, next) {
  // 개발 환경에서는 에러 정보를 보여주고, 프로덕션 환경에서는 숨김
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 에러 페이지 렌더링
  res.status(err.status || 500);
  res.render('error');
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

module.exports = app;