import mongoose, { Document } from 'mongoose';
export interface IActivity extends Document {
    workspace: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    action: string;
    entityId?: mongoose.Types.ObjectId;
    entityType?: string;
    details?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IActivity, {}, {}, {}, mongoose.Document<unknown, {}, IActivity, {}, {}> & IActivity & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=activityModel.d.ts.map