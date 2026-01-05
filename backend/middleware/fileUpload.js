const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload path based on file type
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'courseImage') {
      uploadPath = path.join(uploadsDir, 'courses');
    } else if (file.fieldname === 'lectureVideo') {
      uploadPath = path.join(uploadsDir, 'videos');
    } else if (file.fieldname === 'assignmentFile') {
      uploadPath = path.join(uploadsDir, 'assignments');
    } else if (file.fieldname === 'submissionFile') {
      uploadPath = path.join(uploadsDir, 'submissions');
    } else if (file.fieldname === 'announcementFile') {
      uploadPath = path.join(uploadsDir, 'announcements');
    } else {
      uploadPath = path.join(uploadsDir, 'misc');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, basename + '-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|flv|mkv/;
  const allowedDocTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
  const allowedArchiveTypes = /zip|rar|7z/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  // Check file type based on fieldname
  if (file.fieldname === 'courseImage') {
    const isValidImage = allowedImageTypes.test(extname) && 
                         allowedImageTypes.test(mimetype.split('/')[1]);
    if (isValidImage) {
      return cb(null, true);
    }
    return cb(new Error('Only image files are allowed for course images'));
  }
  
  if (file.fieldname === 'lectureVideo') {
    const isValidVideo = allowedVideoTypes.test(extname) && 
                         mimetype.startsWith('video/');
    if (isValidVideo) {
      return cb(null, true);
    }
    return cb(new Error('Only video files are allowed for lectures'));
  }
  
  // For assignments and submissions, allow documents, images, and archives
  if (file.fieldname === 'assignmentFile' || file.fieldname === 'submissionFile' || 
      file.fieldname === 'announcementFile') {
    const isValidFile = allowedImageTypes.test(extname) || 
                       allowedDocTypes.test(extname) || 
                       allowedArchiveTypes.test(extname);
    if (isValidFile) {
      return cb(null, true);
    }
    return cb(new Error('Invalid file type'));
  }
  
  cb(new Error('Unknown field'));
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: fileFilter
});

// Export various upload configurations
module.exports = {
  uploadSingle: upload.single('file'),
  uploadCourseImage: upload.single('courseImage'),
  uploadLectureVideo: upload.single('lectureVideo'),
  uploadAssignmentFiles: upload.array('assignmentFiles', 5), // Max 5 files
  uploadSubmissionFiles: upload.array('submissionFiles', 5),
  uploadAnnouncementFiles: upload.array('announcementFiles', 5),
  uploadMultiple: upload.array('files', 10) // Max 10 files
};

// Helper function to delete file
exports.deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
