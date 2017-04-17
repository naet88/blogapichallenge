const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));

//initial posts on server load (title, content, author, publishDate)
BlogPosts.create('Post numero uno', 'Hello World Number One', 'Pikachu');
BlogPosts.create('Post numero dos', 'Hello World Number Two', 'Charmander');

app.get('/blog-posts', (req, res) => {
	res.json(BlogPosts.get());
});

app.post('/blog-posts', jsonParser, (req, res) => {
	//ensure title, content, author are in the request body 
	const requiredFields = ['title', 'content', 'author'];

	for (let i = 0; i < requiredFields.length; i++) {
		field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `add \`${field}\` in your request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}

	// the request passes the for loop then do this: 
	const blogpost = BlogPosts.create(req.body.title, req.body.content, req.body.author);
	//2xx codes are success. 201 means, created. 
	//Q: WHY DON'T I NEED A RETURN STATEMENT HERE 
	res.status(201).json(blogpost);
});

//delete using the item number 
app.delete('/blog-posts/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
//204 means that server successfully processed request and is not returning any content 
//that's why you don't need a return statsement 
	res.status(204).end();
});

app.put('/blog-posts/:id', jsonParser, (req, res) => {
	const requiredFields = ['id', 'title', 'author', 'content'];

	for (let i = 0; i < requiredFields.length; i++) {
		const field = requiredFields[i];

		if(!(field in req.body)) {
			const message = `Missing \`${field}\` in request body;
			console.error(message);
			return res.status(400).send(message); 
		}
	}

	if (req.params.id !== req.body.id) {
		//multiline so no need to use \
		// const message = (
		// 	`Your request path id (${req.params.id}) and request body id `
		// 	`(${req.body.id}) must match`);
		const message = `request path id \`${req.params.id}\` and request body id \`${req.body.id}\` must match`
		console.error(message);
		return res.status(400).send(message);
	}

	console.log(`Updating blog post \`${req.params.id}\``);


	const updatedBlogPost = {
		id: req.params.id,
		title: req.body.title,
		author: req.body.author,
		content: req.body.content
	};
	BlogPosts.update(updatedBlogPost);
	res.status(204).json(updatedBlogPost);
});


//always at the end 
app.listen(process.env.PORT || 8080, () => {
  console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
});