#
nest g resource user



1. npm install --save @nestjs/typeorm typeorm pg
2. npm i --save @nestjs/config --> for dotenv
3. npm i --save class-validator class-transformer ---> for validator
4. npm install class-validator class-transformer
5. npm install bcrypt
   npm install --save-dev @types/bcrypt
6. npm install @nestjs/jwt
7. npm i @nestjs-modules/mailer
8. npm install cloudinary and npm install --save-dev @types/multer





# nest g resource token











# Chatgpt Command For Migration
npm run build
npm run migration:generate -- src/migrations/AddDescriptionFiveToTask
npm run migration:run

# To show the list of Migration
npm run typeorm migration:show -- -d typeorm.config.ts


# so here is what we have written for the express convert to nestjs
# show the folder structure and write a clean code too


# this is my folder structure show me how to structure the newly generated code



# sql qeury command
# To search
SELECT * FROM users
WHERE email = 'skippergoroye@gmail.com'



# To delete user 
DELETE FROM users
WHERE email = 'skippergoroye@gmail.com'






enpoint

1. register-> http://localhost:3000/api/user/register
2. login-> http://localhost:3000/api/user/login
3. forgot-password-> http://localhost:5000/api/user/register




# 🍽️ Restaurant Management System (Backend)

This is a purely backend RESTful API project for managing a restaurant. It allows CRUD operations for orders, inventory, tables, reservations, and menus, with proper user roles and authentication for secure access. This backend was tested using Postman.

---

## ✨ Features

- 🔐 User Authentication & Authorization using JWT

- 🧾 Orders: Place, read, update, and delete orders

- 🍽️ Menu Management: Add or modify menu items

- 📦 Inventory Tracking: Manage stock and low inventory alerts

- 🪑 Table Management: Track available/occupied tables

- 📅 Reservations: Schedule and manage reservations

- 👥 Role-Based Access: Secure endpoints based on user roles

- 📫 Fully tested using Postman

## ⚙️ Installation & Setup

1.Clone the Repository

```bash
git clone https://github.com/your-username/restaurant-management-system.git
cd restaurant-management-system
```

2.Initialize the project

install the node modules

```bash
npm init -y
```

3.Update package.json Scripts

In your package.json, add:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

4.Install Dependencies

Run this command to install required packages:

```bash
npm install bcrypt dotenv express express-async-handler express-validator jsonwebtoken moment mongoose body-parser
```

5.Run the Server

```bash
npm run dev
```

---

## 📁 Environment Configuration

Create a .env file in the root directory and add the following:

```ini
PORT=5001
CONNECTION_STRING=your_mongodb_database_url
ACCESS_TOKEN_SECRET=your_secret_key
```

🔒 **Note: .env and node_modules are excluded from the GitHub repository via .gitignore**

---

## 🧪 API Testing

All endpoints were tested using Postman. After starting the server with npm run dev, you can make requests to:

```bash
http://localhost:5001/api/...
```

## 🚧 Endpoints Overview

| Feature      | Endpoints                                                              |
| ------------ | ---------------------------------------------------------------------  |
| Auth         | `/api/user/register`, `/api/user/login`, `/api/user/register`          |
| Orders       | `/api/orders`                                                          |
| Inventory    | `/api/inventory`, `/api/reports/inventory-usage`                       |
| Menu         | `/api/menu`                                                            |
| Tables       | `/api/tables`, `/api/reports/tables-stats`                             |
| Reservations | `/api/reservations`                                                    |
| Reports      | `/api/reports/sales`, `/api/reports/popular-dishes`                    |

## 📌 Notes

- Make sure MongoDB is running or hosted (e.g., MongoDB Atlas)

- Tokens must be sent via headers for authenticated routes:

```http
Authorization: Bearer <token>
```

## 📬 Contributions

Feel free to fork, contribute, or submit issues if you’d like to improve this project!
