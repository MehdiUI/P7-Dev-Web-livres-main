/* eslint-disable no-console */
/* eslint-disable eol-last */
/* eslint-disable max-len */
/* eslint-disable no-multi-spaces */
require('dotenv').config(); // Charger les variables d'environnement depuis le fichier .env
const mongoose = require('mongoose');
const app = require('./app'); // Assurer que 'app.js' contient bien ton application Express

// Variables de connexion MongoDB
const username = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const cluster = process.env.MONGO_CLUSTER;
const dbname = process.env.MONGO_DB;

// Connexion à MongoDB via MongoDB Atlas
mongoose.connect(`mongodb+srv://${username}:${password}@${cluster}/${dbname}?retryWrites=true&w=majority`)
  .then(() => {
    // Si la connexion est réussie
    console.log('Connexion à MongoDB réussie !');
  })
  .catch((error) => {
    // Si la connexion échoue
    console.log('Erreur connexion MongoDB:', error.message);
  });

// Définir le port d'écoute du serveur
const PORT = process.env.PORT || 3001;  // Utiliser le port défini dans .env ou 3001 par défaut

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
