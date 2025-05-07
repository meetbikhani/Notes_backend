const mongoose = require('mongoose');
const crypto = require('crypto');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Encrypt content before saving
noteSchema.pre('save', function(next) {
  if (!this.isModified('content')) return next();
  
  try {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    this.content = cipher.update(this.content, 'utf8', 'hex') + cipher.final('hex');
    next();
  } catch (error) {
    next(error);
  }
});

// Method to decrypt content
noteSchema.methods.decryptContent = function() {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    return decipher.update(this.content, 'hex', 'utf8') + decipher.final('utf8');
  } catch (error) {
    throw new Error('Failed to decrypt content');
  }
};

const Note = mongoose.model('Note', noteSchema);
module.exports = Note; 