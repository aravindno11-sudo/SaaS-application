import mongoose, { Schema, Document } from 'mongoose';
const DocumentSchema = new Schema({
    title: { type: String, required: true, default: 'Untitled' },
    content: { type: String, default: '' },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export default mongoose.model('Document', DocumentSchema);
//# sourceMappingURL=documentModel.js.map