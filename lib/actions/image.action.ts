"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import Image from "../database/models/image.model";
import User from "../database/models/user.model";
import { v2 as cloudinary } from 'cloudinary';
import { redirect } from "next/navigation";

const populateUser = (query: any) => query.populate({
    path: 'author',
    model: User,
    select: '_id firstName username lastName clerkId'
})

// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
    try {
        await connectToDatabase();
        // TO GET The number of images uploaded
        const author = await User.findById(userId);

        if (!author) {
            throw new Error("User not found");
        }

        const newImage = await Image.create({
            ...image,
            author: author._id,
        })

        revalidatePath(path);
        await User.findByIdAndUpdate(userId, { $inc: { uploadsCount: 1 } });

        return JSON.parse(JSON.stringify(newImage));

    } catch (error) {
        handleError(error);
    }
}

// Update Image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
    try {
        await connectToDatabase();

        const imageToUpdate = await Image.findById(image._id);

        if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
            throw new Error("Unauthorized or Image not found");
        }

        const updatedImage = await Image.findByIdAndUpdate(
            imageToUpdate._id,
            image,
            { new: true }
        )

        revalidatePath(path);

        return JSON.parse(JSON.stringify(updatedImage));

    } catch (error) {
        handleError(error);
    }
}

// DELETE IMAGE
export async function deleteImage(imageId: string) {
    try {
        await connectToDatabase();
        await Image.findByIdAndDelete(imageId);

    } catch (error) {
        handleError(error);
    } finally {
        redirect('/')
    }
}

// GET IMAGE
export async function getImageById(imageId: string) {
    try {
        await connectToDatabase();

        // GET the of the user as well
        const image = await populateUser(Image.findById(imageId));

        if (!image) throw new Error("Image not found");

        return JSON.parse(JSON.stringify(image))
    } catch (error) {
        handleError(error);
    }
}

// GET IMAGES
export async function getAllImages({ limit = 9, page = 1, searchQuery = '' }: {
    limit?: number;
    page: Number;
    searchQuery?: string;
}) {
    try {
        await connectToDatabase();

        // Searching 
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
        })

        let expression = 'folder=uxhibit';

        if (searchQuery) {
            expression += ` AND tags=${searchQuery}`
        }

        const { resources } = await cloudinary.search.expression(expression).execute();
        const resourceIds = resources.map((resource: any) => resource.public_id);

        let query = {};

        // if (searchQuery) {
        //     query = {

        //             $or: [
        //                 { publicId: { $in: resourceIds } },
        //                 {
        //                     title: { $regex: searchQuery, $options: 'i' },

        //                 }
        //             ]
        //         }
        // }


        // Add the hide functionality
        if (searchQuery) {
            query = {
                $and: [
                    { hidden: { $ne: true } },
                    {
                        $or: [
                            { publicId: { $in: resourceIds } },
                            { title: { $regex: searchQuery, $options: 'i' } }
                        ]
                    }
                ]
            };
        } else {
            query = { hidden: { $ne: true } };
        }

        // Pagination
        const skipAmount = (Number(page) - 1) * limit;
        const images = await populateUser(Image.find(query))
            .sort({ updatedAt: - 1 })
            .skip(skipAmount)
            .limit(limit);

        const totalImages = await Image.find(query).countDocuments();
        const savedImages = await Image.find().countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPages: Math.ceil(totalImages / limit),
            savedImages
        }
    } catch (error) {
        handleError(error);
    }
}

export async function getUserImages({
    limit = 9,
    page = 1,
    userId }: {
        limit?: number;
        page: number;
        userId: string;
    }) {

    try {
        await connectToDatabase();

        const skipAmount = (Number(page) - 1) * limit;

        const images = await populateUser(Image.find({ author: userId }))
            .sort({ update: - 1 })
            .skip(skipAmount)
            .limit(limit);

        const totalImages = await Image.find({ author: userId }).countDocuments();

        return {
            data: JSON.parse(JSON.stringify(images)),
            totalPages: Math.ceil(totalImages / limit)

        };

    } catch (error) {
        handleError(error);
    }

}