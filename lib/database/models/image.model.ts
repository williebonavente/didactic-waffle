import {Document, model, models, Schema } from 'mongoose';

export interface IImage extends Document {
    title: string;
    transformationType: string;
    publicId: string;
    secureURL: string;
    width: number;
    height: number;
    config: object;
    transformationUrl?: string;
    aspectRatio: string;
    color?: string;
    prompt?: string;
    author: {
        _id: string;
        username: string
        firstName: string;
        lastName: string;
    };
    createdAt?: Date;
    uploadedAt?: Date;
}



const ImageSchema = new Schema ({
    title: { type: String, required: true},
    transformationType: { type: String, required: true },
    publicId: { type: String , required: true},
    secureURL: { type: String, required: true},
    width: { type: Number},
    height: { type: Number },
    config: { type: Object},
    transformationUrl: { type: String},
    aspectRatio: { type: String },
    color: { type: String },
    prompt: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // Added filed
    hidden: { type: Boolean, default: false}
});

const Image = models?.Image || model('Image', ImageSchema);

export default Image;