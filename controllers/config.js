var settings = require("./settings.js");

var user = require("../models/user.js");

var bodyParser = require("body-parser");
var morgan = require("morgan");
var passport = require("passport");
var moment = require("moment-timezone");
var compression = require("compression");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var exphbs = require("express-handlebars");
var localStrategy = require("passport-local");
var nedbStore = require("express-nedb-session")(session);
var dateFormat = require("dateformat");
var methodOverride = require("method-override");

module.exports = function(app, express) {
    require("console-stamp")(console, {
        pattern: settings.TIME_FORMAT,
        colors: {
            stamp: "cyan",
            label: "magenta"
        }
    });

    morgan.token("time", function() {
        return dateFormat(new Date(), settings.TIME_FORMAT);
    });

    // Middleware
    app.use(compression());
    app.use(express.static("public"));
    app.use(morgan("[:time] :method :url :status :res[content-length] - :remote-addr - :response-time ms"));
    app.use(cookieParser(settings.SECRET));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({
        secret: settings.SECRET,
        resave: false,
        saveUninitialized: false,
        store: new nedbStore({ filename: "nedb_sessionstore" })
    }));
    app.use(methodOverride("_method"))
    app.use(passport.initialize());
    app.use(passport.session());

    // Strategies
    passport.use("local-signin", new localStrategy(
        { passReqToCallback: true },
        function(req, username, password, done) {
            return user.authenticate(username, password)
            .then(function(user) {
                console.log("Signed in", user.username);
                done(null, user);
            })
            .catch(function(err) {
                console.error(err);
                done(null, false);
            });
        }
    ));

    passport.use("local-signup", new localStrategy(
        { passReqToCallback: true },
        function(req, username, password, done) {
            return user.add(req, username, password)
            .then(function(user) {
                console.log("Signed up", user.username);
                done(null, user);
            })
            .catch(function(err) {
                console.error(err);
                done(null, false);
            });
        }
    ));

    // Serialization
    passport.serializeUser(function(user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function(username, done) {
        user.get(username)
        .then(function(user) {
            done(null, user);
        })
        .catch(function(err) {
            done(err, false);
        });
    });

    var hbs = exphbs.create({
        defaultLayout: "default",
        helpers: {
            math: require("../helpers/math.js")
        }
    });

    app.enable("case sensitive routing");
    app.enable("strict routing");
    app.disable("x-powered-by");
    app.engine("handlebars", hbs.engine);
    app.set("view engine", "handlebars");
};