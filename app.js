require('dotenv').config()
const express = require('express');
const Sequelize = require('sequelize');
const bodyParser = require('body-parser');
const shortid = require('shortid');
//const jwt = require('jsonwebtoken');
const nJwt = require('njwt');

const app = express();
const protectCheckRouter = express.Router();
app.use(bodyParser.json());

app.set('token', process.env.secret);

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
  userId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
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
    type: Sequelize.STRING,
    allowNull: false
  },
  fileURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
});

const articleContent = sequelize.define('articleContent', {
  articleId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  }
});

const comments = sequelize.define('comments', {
  commentId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  articleId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false
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

//Work on this
app.get('/api/v1/articles/random', function (req, res) {
  articles.find({ order: [ Sequelize.fn( 'RAND' ), ] }).then(articles => {
    res.json(articles)
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

app.get('/api/v1/articles/content/:articleId', function (req, res) {
  const reqArticleId = req.params.articleId;
  articleContent.findOne({ where: { articleId: reqArticleId } }).then(article => {
    //Returns article with specified id as in route
    if(article != null){
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

app.get('/api/v1/users/username/:userId', function (req, res) {
  const reqUserId = req.params.userId;
  users.findOne({ where: { userId: reqUserId }, attributes: ['username'] }).then(user => {
    if(user != null){
      res.json(user);
    }else{
      res.status(404).send({});
    }
  })
})

app.get('/api/v1/hidden/userGen', function (req, res) {
  const newId = '1';
  users.findOrCreate({ 
    //Find if comment ID exist
    where: { userId: newId }, 
    //Set things if it doesn't exist
    defaults: { firstName: 'Jimmy', lastName: 'Li', email: 'jimmyli2002@gmail.com', username: 'jimfutsu', password: 'ACDEFG' } }).spread((comment, created) => {
  })
})

//Create post routes

//USERS STUFF

genUserIdAndCreate = (inFirstName, inLastName, inUsername, inEmail, inPassword) => {
  return new Promise((resolve, reject) => {
    const newId = shortid.generate();
    users.findOrCreate({ 
      //Find if comment ID exist
      where: { userId: newId }, 
      //Set things if it doesn't exist
      defaults: { firstName: inFirstName, lastName: inLastName, username: inUsername, email: inEmail, password: inPassword } }).spread((comment, created) => {
        if(created){
          //Successfully created ID
          resolve(newId);
        }else{
          //Generation failed
          genUserIdAndCreate(inFirstName, inLastName, inUsername, inEmail, inPassword);
        }
    })
  })
}

app.post('/api/v1/users/create', function (req, res) {
  const body = req.body;
  if(body.hasOwnProperty('firstName') && body.hasOwnProperty('lastName') && body.hasOwnProperty('username') && body.hasOwnProperty('email') && body.hasOwnProperty('password')){
    genUserIdAndCreate(body.firstName, body.lastName, body.username, body.email, body.password)
    .then(newId => res.json({ userId: newId }))
  }else{
    res.status(400).send({ 'error': 'You must include in body: firstName, lastName, username, email, and password' });
  }
})

findAndValidate = (inUsername, inPassword) => {
  return new Promise((resolve, reject) => {
    users.findOne({ where: { username: inUsername } }).then(user => {
      if(user != null){
        if(user.password == inPassword){
          resolve(true);
        }else{
          resolve(false);
        }
      }else{
        resolve(false);
      }
    })
  })
}

app.post('/api/v1/users/auth', function (req, res) {
  const body = req.body;
  if(body.hasOwnProperty('username') && body.hasOwnProperty('password')){
    findAndValidate(body.username, body.password).then(ver => {
      if(ver){
        //Matches
        const jwt = nJwt.create(body.username, app.get('token'));
        var token = jwt.compact();
        res.json({
          success: true,
          token: token
        })
      }else{
        //Error
        res.status(403).send({ 'error': 'The username and password combiniation does not match' })
      }
    })
  }else{
    res.status(400).send({ 'error': 'You must include in body: username, and password' });
  }
})

//AUTHENTICATION MIDDLEWARE
protectCheckRouter.use(function(req, res, next){
  var token = req.headers['x-access-token'];

  if(token) {
    const verifiedJwt = nJwt.verify(token, app.get('token'), function(err, decoded){
      if(err){
        //Error
        res.status(403).send({ error: 'Bad JSON Web Token' });
      }else{
        //Verified
        req.decoded = decoded;
        next();
      }
    });
  }else{
    res.status(400).send({ 'error': 'You must send a JSON Web Token in the header with x-access-token' })
  }
})

//Authenticated Routes
genCommentIdAndCreate = (inArticleId, inUserId, inContent) => {
  return new Promise((resolve, reject) => {
    const newId = shortid.generate();
    comments.findOrCreate({ 
      //Find if comment ID exist
      where: { commentId: newId }, 
      //Set things if it doesn't exist
      defaults: { articleId: inArticleId, userId: inUserId, content: inContent } }).spread((comment, created) => {
        if(created){
          //Successfully created ID
          resolve(newId);
        }else{
          //Generation failed
          genCommentIdAndCreate(inArticleId, inUserId, inContent);
        }
    })
  })
}

protectCheckRouter.post('/comments/addComment', function (req, res) {
  //Add comment to article
  const body = req.body;
  //Required info check
  if(body.hasOwnProperty('articleId') && body.hasOwnProperty('userId') && body.hasOwnProperty('content')){
    //Generate commentId in backend, return commentId
    genCommentIdAndCreate(body.articleId, body.userId, body.content).then((newId) => {
      res.json({ commentId: newId });
    })
  }else{
    res.status(400).send({ 'error': 'You must include in body: aricleId, userId, and content' });
  }
})

genArticleIdAndCreate = (inUserId, inTitle, inDescription, inFileURL) => {
  //inFileURL TEMPORARILY ACTUAL CONTENT
  return new Promise((resolve, reject) => {
    const newId = shortid.generate();
    articles.findOrCreate({ 
      //Find if comment ID exist
      where: { articleId: newId }, 
      //Set things if it doesn't exist
      defaults: {userId: inUserId, title: inTitle, description: inDescription, fileURL: "inFileURL" } 
    }).spread((comment, created) => {
        if(created){
          //Successfully created ID
          genArticleContent(newId, inFileURL);
          resolve(newId);
        }else{
          //Generation failed
          genArticleIdAndCreate(inUserId, inTitle, inDescription, inFileURL);
        }
    })
  })
}

genArticleContent = (inArticleId, inArticleContent) => {
  articleContent.findOrCreate({
    //Find if article ID exist
    where: { articleId: inArticleId },
    defaults: { content: inArticleContent }
  })
}

protectCheckRouter.post('/articles/create', function (req, res) {
  //Add comment to article
  const body = req.body;
  //Required info check
  if(body.hasOwnProperty('userId') && body.hasOwnProperty('title') && body.hasOwnProperty('description') && body.hasOwnProperty('fileURL')){
    //FileURL temporarily ACTUAL CONTENT
    //Generate articleId in backend, return articleId
    genArticleIdAndCreate(body.userId, body.title, body.description, body.fileURL).then((newId) => {
      res.json({ articleId: newId });
    })
  }else{
    res.status(400).send({ 'error': 'You must include in body: userId, title, description, and fileURL' });
  }
})

app.use('/api/v1/protected', protectCheckRouter);

app.listen(3000, function () {
  console.log('Listening on port 3000')
})
