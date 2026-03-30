import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    currentWorkspace: { type: Schema.Types.ObjectId, ref: 'Workspace' },
}, { timestamps: true });
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (err) {
        next(err);
    }
});
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=userModel.js.map