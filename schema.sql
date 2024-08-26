
create database testing;
use testing;


CREATE TABLE users (

    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL ,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'

);


CREATE TABLE policies (

    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_number VARCHAR(20)  NOT NULL UNIQUE,
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
    policy_number VARCHAR(20)  NOT NULL UNIQUE,
    insured_party VARCHAR(100) NOT NULL,
    coverage_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    premium_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('active', 'inactive', 'expired') NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    
);
