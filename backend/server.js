const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = require('./server/app');

const PORT = process.env.PORT ;

//database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/finscope")
  .then((e) => console.log("MongoDB Connected"));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});