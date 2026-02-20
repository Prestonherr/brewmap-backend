# BrewMap Backend

A RESTful API backend for BrewMap, an application that helps users discover and manage their favorite coffee shops.

## Features

- **User Authentication**: Sign up and login with JWT token-based authentication
- **Coffee Shop Management**: Create, retrieve, and delete coffee shop listings
- **User Profiles**: View and update user information
- **Data Validation**: Comprehensive input validation using Celebrate
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

## API Endpoints

### Authentication (Public)

#### Sign Up

- **POST** `/api/signup`
- **Validation**: Email format, password min length 6, name 2-30 characters
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }
  ```
- **Response**: User object with JWT token

#### Sign In

- **POST** `/api/signin`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: User object with JWT token

### User Endpoints (Protected)

All user endpoints require JWT authentication via the `Authorization` header.

#### Get Current User

- **GET** `/api/users/me`
- **Response**: Current user's profile information

#### Update User

- **PATCH** `/api/users/me`
- **Body**:
  ```json
  {
    "email": "newemail@example.com",
    "name": "Jane Doe"
  }
  ```
- **Response**: Updated user object

### Coffee Shop Endpoints (Protected)

All coffee shop endpoints require JWT authentication.

#### Get All Coffee Shops

- **GET** `/api/coffee-shops`
- **Response**: Array of coffee shops for the current user

#### Create Coffee Shop

- **POST** `/api/coffee-shops`
- **Validation**: Name required, valid coordinates (lat/lon)
- **Body**:
  ```json
  {
    "name": "Local Cafe",
    "address": "123 Main St",
    "lat": 40.7128,
    "lon": -74.006,
    "tags": {},
    "osmId": "optional-osm-id"
  }
  ```
- **Response**: Created coffee shop object

#### Delete Coffee Shop

- **DELETE** `/api/coffee-shops/:coffeeShopId`
- **Response**: Success message

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After signing up or logging in, include the token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are validated by the `auth` middleware, which checks:

- Token presence and format
- Token validity and expiration
- User existence and active status

## Development Scripts

- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with auto-reload
- `npm run lint` - Run ESLint to check code quality

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/Prestonherr/brewmap-backend).
