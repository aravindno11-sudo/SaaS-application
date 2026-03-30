import mongoose, { Document } from 'mongoose';
export interface IDocument extends Document {
    title: string;
    content: string;
    workspace: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IDocument, {}, {}, {}, mongoose.Document<unknown, {}, IDocument, {}, {}> & IDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=documentModel.d.ts.map