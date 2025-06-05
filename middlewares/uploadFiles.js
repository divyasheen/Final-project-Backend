//JB: Disclaimer: It is just me playing around with stuff

import multer from 'multer';
// JB: without this build-in-middleware express couldn't read the upload

// JB: store and export the middleware in a variable without dest -> so the file is stored in RAM
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: max 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bilddateien erlaubt!'), false);
    }
  }
});

export default upload;
 