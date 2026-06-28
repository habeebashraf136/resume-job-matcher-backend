import mongoose from 'mongoose';
import type { IUser } from '../types/auth.types.ts';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        password: {
            type: String,
            required: true,
            select: false, 
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({username: 1, email: 1});

userSchema.pre('save',async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
})

userSchema.methods.comparePassword = async function(comparePassword: string) {
    return await bcrypt.compare(comparePassword, this.password);
}


const userModel = mongoose.model<IUser>('User', userSchema);

export default userModel;