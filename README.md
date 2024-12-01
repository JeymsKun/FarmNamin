# FarmNamin






# Project Setup Guide for Backend

## Description 
This project uses XAMPP and MySQL to manage the backend services. XAMPP is a free and open-source cross-platform web server solution stack package developed by Apache Friends, consisting mainly of the Apache HTTP Server, MySQL database, and interpreters for scripts written in the PHP and Perl programming languages. MySQL is a widely used relational database management system (RDBMS) that allows you to manage databases and interact with the data through SQL.

## XAMPP and MySQL Setup

### Step 1: Install XAMPP 
1. Download XAMPP from the official website: [XAMPP Download](https://dev.to/aakriti_sharma/how-to-run-php-and-link-to-mysql-using-xampp-57lh). 
2. Follow the installation wizard to install XAMPP on your computer.

### Step 2: Start XAMPP Services
1. Open the XAMPP Control Panel. 
2. Start the **Apache** and **MySQL** modules by clicking the "Start" button next to each module.

### Step 3: Copy `htdocs` Folder to XAMPP
This backend folder contains the `htdocs` directory with all the necessary PHP files. To set up the project, copy this `htdocs` folder to the XAMPP installation directory.

### Step 4: Verify the Setup
1. Open the web browser and navigate to the default URL: http://localhost/.

    * If http://localhost/ (which is 127.0.0.1) works, you should see that this application is running.

    * If not, you can use your machine's local IP address (e.g., http://192.168.1.100/) to access the application.