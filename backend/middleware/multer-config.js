/* eslint-disable padded-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable prefer-template */
/* eslint-disable comma-dangle */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable eol-last */
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration de stockage temporaire avec multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images/temp');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    callback(null, Date.now() + '_' + name);
  }
});

const fileFilter = (req, file, callback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Type de fichier non supporté ! Seulement JPEG, PNG, JPG et WEBP.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
}).single('image');

const { pipeline } = require('stream/promises');
const { createReadStream, createWriteStream } = require('fs');

const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  const originalTempPath = req.file.path;
  const imagesDir = 'images';

  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

  const fileNameWithoutExt = path.parse(req.file.filename).name.replace(/[^a-zA-Z0-9-_]/g, '_');
  const webpFileName = `${Date.now()}_optimized_${fileNameWithoutExt}.webp`;
  const outputFilePath = path.join(imagesDir, webpFileName);

  try {
    console.log('🟡 Conversion en cours :', originalTempPath);

    // ✅ On passe par une pipeline manuelle
    await pipeline(
      createReadStream(originalTempPath),
      sharp().resize({ width: 800 }).webp({ quality: 80 }),
      createWriteStream(outputFilePath)
    );

    // ✅ Met à jour l'objet req.file pour utiliser l'image optimisée
    req.file.path = outputFilePath;
    req.file.filename = webpFileName;

    // ✅ Supprime le fichier temporaire maintenant que Sharp a bien libéré le stream
    try {
      await fs.promises.unlink(originalTempPath);
      console.log('✅ Fichier temporaire supprimé :', originalTempPath);
    } catch (err) {
      console.error('❌ Suppression échouée :', err);
    }

    next();
  } catch (error) {
    console.error("❌ Erreur pendant l'optimisation :", error);
    next(error);
  }
};

module.exports = { upload, optimizeImage };
