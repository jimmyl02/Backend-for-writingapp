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

const users = sequelize.define('users', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  username: {
    type: Sequelize.STRING
  },
  userId: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

const articles = sequelize.define('articles', {
  articleId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING
  }
  fileURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
});

const comments = sequelize.define('comments', {
  commentId: {
    type: Sequelize.STRING
  },
  userId: {
    type: Sequelize.STRING
  },
  artcileId: {
    type: Sequelize.STRING
  },
  content: {
    type: Sequelize.TEXT
  },
  time: {
    type: Sequelize.DATE
  }
})

app.get('/sqlTest', function (req, res){
	sequelize
	  .authenticate()
	  .then(() => {
	    //console.log('Connection has been established successfully.');
      res.send("Connection has been established successfully");
	  })
	  .catch(err => {
	    //console.error('Unable to connect to the database:', err);
      res.send("Unable to connect to the database:", err);
	  });
})

app.get('/api/v1/articles/:articleId', function (req, res) {
  res.send('hello world')
})

app.get('/api/v1/comments/:articleId', function (req, res) {
  res.send('hello world')
})

app.get('/api/v1/users/articles/:userId', function (req, res) {
  res.send('hello world')
})

app.listen(3000, function () {
  console.log('Listening on port 3000')
})
