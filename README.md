## Description

A software to lost and found objects.
The server provides endpoint to register and recovered objects, alow separete it by category.

The system contain two type of user: institution who administrate the objects and applicant who search it.

This project use:

- Jest for unit test;
- Mongo to database;
- Node with Express to backend;
- Swagger to documentation;
- Mailgun to send email;
- Handlebars to generate html template;
- Joi to validate request's body;
- Jsonwebtoken to autenticate;

## Running locally
```
  npm install
  npm start
```
## Running the tests
```
npm test
```