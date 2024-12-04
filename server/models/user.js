import mongoose from 'mongoose'; // Use 'import' instead of 'require'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    resetToken: { type: String, default: '' }
});

const User = mongoose.model('User', userSchema);

export default User; // Use 'export default' for the model
