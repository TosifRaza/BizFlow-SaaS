const mongoose = require('mongoose');
const supportRequestSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  category: { type: String, enum: ['technical', 'billing', 'feature_request', 'bug_report', 'general'], default: 'general' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  response: { type: String, trim: true },
  resolvedAt: Date,
  closedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
supportRequestSchema.pre('save', function () { this.updatedAt = new Date(); });
module.exports = mongoose.model('SupportRequest', supportRequestSchema);
