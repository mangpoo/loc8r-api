const mongoose = require('mongoose');
const readline = require('readline');

// [수정] Mongoose 6+ 버전에서는 'strictQuery'를 명시적으로 설정합니다.
mongoose.set("strictQuery", false);

// [수정] .env 파일에서 비밀번호를 가져옵니다.
const dbPassword = process.env.MONGODB_PASSWORD;

// [수정] ★★★ 주소 변경 완료! (s0fko -> wkzwxgg) ★★★
// 데이터베이스 이름(/Loc8r)도 뒤에 꼭 붙여주어야 합니다.
const dbURI = `mongodb+srv://tmddns98:${dbPassword}@cluster0.wkzwxgg.mongodb.net/Loc8r?appName=Cluster0`;

// **1. Mongoose 연결 함수 정의 및 즉시 실행**
const connect = () => {
  mongoose.connect(dbURI)
    .then(() => console.log('Mongoose connected to ' + dbURI))
    .catch(err => {
      console.error('Mongoose initial connection error: ' + err);
    });
};

connect(); // 함수를 즉시 호출하여 연결을 시작합니다.

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
require('./locations');
require('./users');