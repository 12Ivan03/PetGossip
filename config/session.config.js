const session = require('express-session');
const MongoStore = require('connect-mongo');
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/PetGossipView";

module.exports = app => {
    app.set('trust proxy', 1);
    app.use(
        session({
            secret: process.env.SESS_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure:process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24
            },
            store: MongoStore.create({ 
                mongoUrl: MONGO_URI
            })
        })
    );
};
