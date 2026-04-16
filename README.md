# BrewMap Backend

A RESTful API backend for BrewMap, an application that helps users discover and manage their favorite coffee shops.

## Features

- **User Authentication**: Sign up and login with JWT token-based authentication
- **Coffee Shop Management**: Create, retrieve, and delete coffee shop listings
- **User Profiles**: View and update user information
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Request and error logging using Winston
- **CORS Support**: Cross-origin resource sharing enabled for frontend integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Celebrate (Joi)
- **Logging**: Winston & Express-Winston
- **Development**: Nodemon, ESLint, Prettier
