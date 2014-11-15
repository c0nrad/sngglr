# API

## User:
- /api/user/
	POST
		params: 
			- username
			- email
			- password

- /api/user/:id
	:id -> userID | me

	GET
		Returns user info
	PUT
		Updates user info
		params:
			- non senestive user fields
	DELETE
		Deletes user info

- /api/user/:id/picture
	GET
		Get all pictures
	POST
		Add a new photo
		PARAMS:
			- url
	Delete
		PARAMS:
			index: index of image

- /api/user/:id/comment
	:id -> who you are commenting on

	GET
		Get all comments for user
	POST
		Add new cmment for user
		PARAMS:
			comment: actual comment

## Likes

- /api/user/:id/likes
	:id -> userId | me

	GET
		get all likes a user made

	POST
		likee: userid
		type: yes | maybe | no

- /api/user/:id/likes/:id
	PUT 
		Update a like
<!-- 
- /api/likes/:id
	Update a like -->

## Play

/api/play
	
	Returns a motential match

## Matches

/api/user/:id/matches
	GET

/api/user/:id/matches/:id
	GET


/api/user/:id/matches/:id/chat
	GET
	POST

