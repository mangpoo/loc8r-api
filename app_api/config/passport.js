const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  // [변경] async 키워드 추가
  async (username, password, done) => {
    try {
      // [변경] 콜백 지우고 await 사용
      const user = await User.findOne({ email: username });
      
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));