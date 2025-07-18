// clerkId, email, user, photo, firstName, lastName, planId, creditBalance
import { model, models, Schema } from 'mongoose';

const UserSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    username: {
        type: String,
        required: true,
        unique: true,
    },
    
    photo: {
        type: String,
        required: true,
    },

    firstName : {
        type: String,
        required: true 
    },

    lastName : {
        type: String,
        required: true
    }, 

    planId: {
        type: Number,
        default: 1
    },

    creditBalance: {
        type: Number,
        default: 10, 
    },
    
});

const User = models?.User || model("User", UserSchema);
export default User;