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
  },
  fileURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
});

const comments = sequelize.define('comments', {
  commentId: {
    type: Sequelize.STRING
  },
  articleId: {
    type: Sequelize.STRING
  },
  userId: {
    type: Sequelize.STRING
  },
  content: {
    type: Sequelize.TEXT
  },
  time: {
    type: Sequelize.DATE
  },
})

sequelize.sync();
//sequelize.sync({ force: true });
//Used to update database when making modifications to tables
//TODO REMOVE FORCE BEFORE IT IS IN PRODUCTION

//Test sql connection to database
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
  const reqArticleId = req.params.articleId;
  articles.findAll({ where: { articleId: reqArticleId } }).then(article => {
    //Returns article with specified id as in route
    if(article.length > 0){
      res.json(article);
    }else{
      res.status(404).send({});
    }
  })
})

app.get('/api/v1/comments/:articleId', function (req, res) {
  const reqArticleId = req.params.articleId;
  comments.findAll({ where: { articleId: reqArticleId } }).then(comments => {
    //Returns all comments associated with articleId
    if(comments.length > 0){
      res.json(comments);
    }else{
      res.status(404).send({});
    }
  })
})

app.get('/api/v1/users/articles/:userId', function (req, res) {
  const reqUserId = req.params.userId;
  articles.findAll({ where: { userId: reqUserId } }).then(articles => {
    if(articles.length > 0){
      res.json(articles);
    }else{
      res.status(404).send({});
    }
  })
})

app.get('/api/v1/users/comments/:userId', function (req, res) {
  const reqUserId = req.params.userId;
  comments.findAll({ where: { userId: reqUserId } }).then(comments => {
    if(comments.length > 0){
      res.json(comments);
    }else{
      res.status(404).send({});
    }
  })
})

//Create post routes
app.post('/api/v1/articles/addComment', function (req, res) {
  //Add comment to article
  const body = JSON.parse(req.body);
  //Required info check
  if(body.hasOwnProperty('articleId') && body.hasOwnProperty('commentId') && body.hasOwnProperty('userId') && body.hasOwnProperty('content')){
    
  }else{

  }
})

app.listen(3000, function () {
  console.log('Listening on port 3000')
})
