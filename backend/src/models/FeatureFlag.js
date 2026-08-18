const mongoose = require('mongoose');
const featureFlagSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  enabled: { type: Boolean, default: false },
  enabledForPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
  enabledForBusinesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
featureFlagSchema.pre('save', function () { this.updatedAt = new Date(); });
module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
