require('dotenv').config()
const express = require('express');
const Sequelize = require('sequelize');

const app = express();


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

app.get('/sqlTest', function (req, res){
	//console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS);
	sequelize
	  .authenticate()
	  .then(() => {
	    console.log('Connection has been established successfully.');
	    console.log(process.env.USER);
	  })
	  .catch(err => {
	    console.error('Unable to connect to the database:', err);
	  });
})

app.get('/api/v1/articles', function (req, res) {
  res.send('hello world')
})

app.listen(3000, function () {
  console.log('Listening on port 3000')
  console.log('tmp text')
})
