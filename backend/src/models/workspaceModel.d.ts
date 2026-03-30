import mongoose, { Document } from 'mongoose';
export interface IWorkspace extends Document {
    name: string;
    owner: mongoose.Types.ObjectId;
    members: {
        user: mongoose.Types.ObjectId;
        role: 'owner' | 'admin' | 'member';
    }[];
}
declare const _default: mongoose.Model<IWorkspace, {}, {}, {}, mongoose.Document<unknown, {}, IWorkspace, {}, {}> & IWorkspace & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=workspaceModel.d.ts.map