var db = require("../models");

// Using BCRYPT so that users password is hashed in our database
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function (app, passport) {

  // Dummy page for testing features
  app.get("/test", function (req, res) {
    res.render("testAuth");
  });

  // Authentication Routes
  // Returning User (Login)
  app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/test"
  }));
//   Above redirects are not working ***

  app.get("/logout", function(req, res) {
    req.logout();
    req.session.destroy();
    res.redirect("/");
  })


  // New user
  app.post("/newuser", function (req, res) {
    var password = req.body.password
    bcrypt.hash(password, saltRounds, function (err, hash) {
      db.Profile.create({
        username: req.body.username,
        password: hash
      }).then(function (data) {

        const user_id = data.get("id");

        console.log(user_id);
        req.login(user_id, function (err) {
          res.redirect("/");
        });
      });
    });
  });

  passport.serializeUser(function (user_id, done) {
    done(null, user_id);
  });

  passport.deserializeUser(function (user_id, done) {
    done(null, user_id);
  });

  // Call this function right after the route ("/") to restrict access if not logged in...
  function authenticationMiddleware() {
    return (req, res, next) => {
      console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
      if (req.isAuthenticated()) return next();
      res.redirect("/")
    }
  }
};