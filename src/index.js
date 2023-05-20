const express = require('express');
const mongoose = require('mongoose');
const route = require('./router/router');
const dotenv = require('dotenv');
const multer= require("multer");
const cors= require("cors")

const app = express();
app.use(express.json());
app.use(multer().any());
app.use(cors())


dotenv.config();
const PORT = process.env.PORT;
const URL = process.env.URL;

mongoose.connect(URL, { useNewUrlParser: true })
  .then(() => console.log('Db is connected'))
  .catch((err) => console.error(err));

app.use('/', route);

app.listen(PORT, () => {
  console.log(`App is live on port ${PORT}`);
});
