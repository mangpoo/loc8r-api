const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const register = async (req, res) => { // [변경] async 키워드 추가
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ "message": "All fields required" });
  }

  const user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.setPassword(req.body.password);

  try {
    // [변경] 콜백 대신 await 사용
    await user.save();
    
    // 성공 시 토큰 생성 및 응답
    const token = user.generateJwt();
    res
      .status(200)
      .json({ token });
  } catch (err) {
    // 에러 발생 시 처리
    res
      .status(400)
      .json(err);
  }
};

const login = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .json({ "message": "All fields required" });
  }

  // Passport의 authenticate 메서드는 여전히 콜백 패턴을 사용합니다.
  passport.authenticate('local', (err, user, info) => {
    let token;

    if (err) {
      return res
        .status(404)
        .json(err);
    }

    if (user) {
      token = user.generateJwt();
      res
        .status(200)
        .json({ token });
    } else {
      res
        .status(401)
        .json(info);
    }
  })(req, res);
};

module.exports = {
  register,
  login
};