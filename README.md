# Memories App

This is a serverless application allows you to store your cherished memories and keep them to yourself. Upload image to reminisce and mark your favorites.

### Backend

The backend employed using API Gateway, Lambda Functions, DynamoDB to store data and S3 to store images has already been deployed to AWS using the serverless framework

### Frontend

The frontend of the application is built using React and derived from the todo serverless application frontend. The backend and auth0 is already integrated into the front end.

### Getting started

Simply clone the repository and go to the client folder. Run `npm install` and then `npm start`. The front end application would load up on http://localhost:3000/

### Basics

- Click on Log in button, you will be redirected to the authentication page. Choose to sign in through Google or Sign up with your username and password
- Under Memories, start typing out your memory and then click on New memory. The same will get added in your list
- Click on the checkbox to mark the memory as your favorite. Click again to undo the same
- Click on the pencil icon. You will be redirected to a page where you can upload an image related to the memory. After the upload is successful, click on Home and see the memory load up with the picture
- Click on the cross icon to delete the memory
