/* eslint-disable no-console */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/order */
/* eslint-disable comma-dangle */
/* eslint-disable max-len */
/* eslint-disable eol-last */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-trailing-spaces */
/* eslint-disable arrow-parens */
/* eslint-disable no-unused-vars */

const Book = require('../models/Bookmodels');
const fs = require('fs');

exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.getBestBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.createBook = (req, res) => {
  console.log('req.body:', req.body);
  console.log('req.file:', req.file);
  try {
    const bookObject = req.body.book ? JSON.parse(req.body.book) : req.body;

    delete bookObject._id;
    delete bookObject._userId;

    const userId = req.auth.userId;

    let initialRating = 0;

    if (Array.isArray(bookObject.ratings) && bookObject.ratings.length > 0) {
      // Prendre la première note du tableau ratings si présente
      initialRating = Number(bookObject.ratings[0].grade) || 0;
    } else if (bookObject.rating !== undefined) {
      initialRating = Number(bookObject.rating);
    } else if (req.body.rating !== undefined) {
      initialRating = Number(req.body.rating);
    }

    const book = new Book({
      title: bookObject.title,
      author: bookObject.author,
      year: Number(bookObject.year),
      genre: bookObject.genre,
      userId,
      imageUrl: req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : '',
      ratings: initialRating > 0 ? [{ userId, grade: initialRating }] : [],
      averageRating: initialRating > 0 ? initialRating : 0,
    });

    book.save()
      .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
      .catch(error => {
        if (req.file) {
          fs.unlink(req.file.path, () => {});
        }
        res.status(400).json({ error });
      });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(400).json({ error: error.message });
  }
};

exports.modifyBook = (req, res) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/${req.file.path}`
  } : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      if (req.file) {
        const filename = book.imageUrl.split('/').pop();
        fs.unlink(`images/${filename}`, () => {});
      }

      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const filename = book.imageUrl.split('/').pop();
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(400).json({ error }));
};

exports.rateBook = (req, res) => {
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      const existingRatingIndex = book.ratings.findIndex(r => r.userId === userId);

      if (existingRatingIndex !== -1) {
        // L'utilisateur a déjà noté : on modifie sa note
        book.ratings[existingRatingIndex].grade = rating;
      } else {
        // Nouvelle note
        book.ratings.push({ userId, grade: rating });
      }

      // Mise à jour de la moyenne
      const sumRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
      const totalRatings = book.ratings.length;
      book.averageRating = Math.round((sumRatings / totalRatings) * 100) / 100;

      return book.save();
    })
    .then(updatedBook => res.status(200).json(updatedBook))
    .catch(error => res.status(400).json({ error }));
};
