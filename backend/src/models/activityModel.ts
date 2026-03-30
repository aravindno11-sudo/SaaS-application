import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  action: string;
  entityId?: mongoose.Types.ObjectId;
  entityType?: string;
  details?: string;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    entityType: { type: String },
    details: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IActivity>('Activity', ActivitySchema);
