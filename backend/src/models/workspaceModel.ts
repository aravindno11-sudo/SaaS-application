import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: 'owner' | 'admin' | 'member';
  }[];
  subscription?: {
    plan: 'free' | 'pro';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status?: string;
  };
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
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
  },
  { timestamps: true }
);

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
