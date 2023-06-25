const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const FacebookStrategy = require('passport-facebook').Strategy

const db = require('../models')
const User = db.User

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered!' })
        }
        return bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) {
            return done(null, false, { message: 'Email or Password incorrect.' })
          }
          return done(null, user)
        })
      })
      .catch(err => done(err, false))
  }))


  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
},
    (accessToken, refreshToken, profile, done) => {
        // console.log(profile)
        const { name, email } = profile._json

        User.findOne({ where: { email } })
            .then(user => {
                if (user) return done(null, user)

                const randomPassword = Math.random().toString(36).slice(-8)   

                bcrypt.genSalt(10)
                    .then(salt => bcrypt.hash(randomPassword, salt))
                    .then(hash => User.create({
                        name,
                        email,
                        password: hash
                    }))
                    .then(user => done(null, user))
                    .catch(err => done(err, false))
            })
        // console.log(profile)

        // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        //   return cb(err, user);
        // });
    }
));



  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findByPk(id)              ///////查詢特定 id 的 User
      .then((user) => {
        user = user.toJSON()       ///////把 user 物件轉成 plain object
        done(null, user)           ///////回傳給 req 繼續使用
      }).catch(err => done(err, null))
  })
}