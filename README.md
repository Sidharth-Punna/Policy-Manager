
# Policy CRUD Assignment

This project provides a RESTful API for managing insurance policies. It includes endpoints to create, read, update, and delete policy records. The project uses Express.js for handling HTTP requests and a SQL database for storing policy information.

## Installation

Run the following command to install all the necessary dependencies:

\`\`\`bash
npm install
\`\`\`

## Set Up SQL Connection

Configure your SQL database connection in the \`database.js\` file located in the \`Database\` folder.

## SQL Setup

### Create Tables

Use the schema below to create the necessary tables in your SQL database. The \`schema.sql\` file is also included in the project.

\`\`\`sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_number VARCHAR(20) NOT NULL UNIQUE,
    insured_party VARCHAR(100) NOT NULL,
    coverage_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'inactive', 'expired') NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE request_policy (
    req_id INT AUTO_INCREMENT PRIMARY KEY,
    policy_number VARCHAR(20) NOT NULL UNIQUE,
    insured_party VARCHAR(100) NOT NULL,
    coverage_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'inactive', 'expired') NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

## Start the Server

Run the following command to start the server:

\`\`\`bash
npm start
\`\`\`

The server will start running at \`http://localhost:8080\`.

## Project Structure

 service/user.js contains the user side code for the CRUD operations.
 services/admin.js` contains the admin side code for the CRUD operations.
 
 middleware/isUser.js contains the user Authentication middleware.
 middleware/isAdmin.js` contains the admin Authentication middleware.

 controller/user.js contains the user side  routes
 controller/admin.js` contains the admin side routes

config/.env has the secrect key for token

public/ folder has all the frontend code for user and admin

