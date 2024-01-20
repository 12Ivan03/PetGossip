// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");
const path = require("path");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);
require('./config/session.config')(app);

hbs.registerPartials(path.join(`${__dirname}/views/partials`));

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "PetGossipView";

app.locals.appTitle = `${capitalize(projectName)}`;

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const authRoutes = require('./routes/auth.route');
app.use('/', authRoutes);

const userRoutes = require('./routes/user.route');
app.use("/", userRoutes);

const petRoutes = require('./routes/pet.route');
app.use('/', petRoutes);

const commentRoutes = require('./routes/comment.route');
app.use('/', commentRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
