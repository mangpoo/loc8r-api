const mongoose = require('mongoose');
const readline = require('readline');

// Mongoose 6+ 버전에서는 'strictQuery'를 명시적으로 설정합니다.
mongoose.set("strictQuery", false);

// .env 파일에서 비밀번호를 가져옵니다.
const dbPassword = process.env.MONGODB_PASSWORD;

// 로컬 DB URI를 주석 처리합니다.
// const dbURI = 'mongodb://localhost:27017/Loc8r'; 

// Atlas 연결 URI로 변경합니다.
const dbURI = `mongodb+srv://tmddns98:${dbPassword}@cluster0.wkzwxgg.mongodb.net/Loc8r`;


// 1. Mongoose 연결 함수 정의 및 즉시 실행
const connect = () => {
  mongoose.connect(dbURI)
    .then(() => console.log('Mongoose connected to ' + dbURI))
    .catch(err => {
      console.error('Mongoose initial connection error: ' + err);
    });
};

connect(); // 함수를 즉시 호출하여 연결을 시작합니다.

// 2. 연결 이벤트 핸들러
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});


// [★★★★★ ★★★★★ 수정된 부분 ★★★★★ ★★★★★]
// 3. 우아한 종료 (Graceful Shutdown) 로직 (async/await 적용)

// mongoose.connection.close()가 Promise를 반환하므로 async/await 사용
const gracefulShutdown = async (msg) => {
  try {
    await mongoose.connection.close();
    console.log(`Mongoose disconnected through ${msg}`);
  } catch (err) {
    console.error(`Mongoose disconnection error: ${err}`);
  }
};

// Windows용 SIGINT (로컬 개발 시)
if (process.platform === 'win32') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

// nodemon 재시작 신호 (SIGUSR2)
process.once('SIGUSR2', async () => {
  await gracefulShutdown('nodemon restart');
  process.kill(process.pid, 'SIGUSR2');
});

// 앱 종료 신호 (SIGINT)
process.on('SIGINT', async () => {
  await gracefulShutdown('app termination');
  process.exit(0);
});

// Render/Heroku 등 배포 환경 종료 신호 (SIGTERM)
process.on('SIGTERM', async () => {
  await gracefulShutdown('Render app shutdown');
  process.exit(0);
});
// [★★★★★ 수정 끝 ★★★★★]


// 4. 모델 파일 불러오기
require('./locations');