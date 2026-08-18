const mongoose = require('mongoose');
const platformSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
