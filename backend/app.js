/* eslint-disable no-console */
const express = require('express');
const path = require('path');
const bookRoutes = require('./routes/bookroutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();

// Middleware pour parser le JSON
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Routes
app.use('/api/books', bookRoutes); // Pour les livres
app.use('/api/users', userRoutes); // Pour l'authentification des utilisateurs
app.use('/images', express.static(path.join(__dirname, 'images'))); // Pour servir les images

module.exports = app;
