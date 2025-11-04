const mongoose = require('mongoose');
const readline = require('readline');

// **MongoDB URI 설정**
// 로컬 환경의 Loc8r 데이터베이스를 가정합니다. 포트가 다를 경우 수정하세요.
const dbURI = 'mongodb://localhost:27017/Loc8r'; 

// **1. Mongoose 연결 함수 정의 및 즉시 실행**
const connect = () => {
  // .connect()는 Promise를 반환합니다.
  mongoose.connect(dbURI)
    .then(() => console.log('Mongoose connected to ' + dbURI))
    .catch(err => {
      // 초기 연결 오류 발생 시 로그 출력
      console.error('Mongoose initial connection error: ' + err);
      // 필요에 따라 여기에 재연결 로직을 추가할 수 있습니다 (예: setTimeout(() => connect(), 5000))
    });
};

connect(); // **💡 핵심 수정: 함수를 즉시 호출하여 연결을 시작합니다.**

// **2. 연결 이벤트 핸들러**
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});


// **3. 우아한 종료 (Graceful Shutdown) 로직**
if (process.platform === 'win32') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close(() => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});


// **4. 모델 파일 불러오기**
// Mongoose 모델 스키마가 정의된 파일을 불러와야 Model을 사용할 수 있습니다.
// 이 파일은 컨트롤러 파일보다 먼저 실행되어야 합니다.
require('./locations');