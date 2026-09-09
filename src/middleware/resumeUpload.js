import multer from 'multer';

const allowedTypes = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
]);

const resumeUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (allowedTypes.has(file.mimetype)) {
            callback(null, true);
            return;
        }
        callback(new Error('Only PDF, DOCX, and plain-text resumes are supported'));
    }
});

export default resumeUpload;
