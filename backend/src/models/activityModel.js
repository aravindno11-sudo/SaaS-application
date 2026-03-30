import mongoose, { Schema, Document } from 'mongoose';
const ActivitySchema = new Schema({
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String },
    details: { type: String },
}, { timestamps: true });
export default mongoose.model('Activity', ActivitySchema);
//# sourceMappingURL=activityModel.js.map