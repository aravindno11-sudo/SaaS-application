import mongoose, { Model } from 'mongoose';
export interface IUser {
    name: string;
    email: string;
    password: string;
    currentWorkspace?: mongoose.Types.ObjectId;
}
export interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
}
type UserModel = Model<IUser, {}, IUserMethods>;
declare const _default: UserModel;
export default _default;
//# sourceMappingURL=userModel.d.ts.map