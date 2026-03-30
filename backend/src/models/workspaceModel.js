import mongoose, { Schema, Document } from 'mongoose';
const WorkspaceSchema = new Schema({
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
        {
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            role: {
                type: String,
                enum: ['owner', 'admin', 'member'],
                default: 'member',
            },
        },
    ],
    subscription: {
        plan: { type: String, enum: ['free', 'pro'], default: 'free' },
        stripeCustomerId: { type: String },
        stripeSubscriptionId: { type: String },
        status: { type: String },
    },
}, { timestamps: true });
export default mongoose.model('Workspace', WorkspaceSchema);
//# sourceMappingURL=workspaceModel.js.map