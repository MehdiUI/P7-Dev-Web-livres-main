/* eslint-disable consistent-return */
/* eslint-disable eol-last */
/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
/* eslint-disable arrow-parens */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Usermodels');

exports.signup = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  User.findOne({ email })
    .then(user => {
      if (user) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }

      bcrypt.hash(password, 10)
        .then(hash => {
          const newUser = new User({ email, password: hash });
          newUser.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé avec succès' }))
            .catch(error => res.status(500).json({ error }));
        });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

      bcrypt.compare(password, user.password)
        .then(valid => {
          if (!valid) return res.status(401).json({ message: 'Mail ou sMot de passe incorrect' });

          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET,
              { expiresIn: '24h' }
            )
          });
        });
    })
    .catch(error => res.status(500).json({ error }));
};