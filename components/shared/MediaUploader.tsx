"use client"

import { CldUploadWidget, CldImage } from "next-cloudinary"
import { toast } from "sonner"
import Image from "next/image";
import { dataUrl, getImageSize } from "@/lib/utils";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";

type MediaUploaderProps = {
    onValueChange: (value: string) => void;
    setImage: React.Dispatch<any>;
    publicId: string;
    image: any;
    type: string;
}

const MediaUploader = ({
    onValueChange,
    setImage,
    image,
    publicId,
    type
}: MediaUploaderProps) => {
    const onUploadSuccessHandler = (result: any) => {
        setImage((prevState: any) => ({
            ...prevState,
            publicId: result?.info?.public_id,
            width: result?.info?.width,
            height: result?.info?.height,
            secureURL: result?.info.secure_url
        }))

        onValueChange(result?.info?.public_id)
        toast(
            <div>
                <span className="font-bold">Image Upload successfully.</span>
            </div>,

            {
                duration: 5000,
                className: 'success-toast'
            }
        )

    }

    const onUploadErrorHandler = (result: any) => {
        toast(

            <div>
                <span className="font-bold">Something went wrong while uploading.</span>
                <p>Please Try Again</p>
            </div>,
            {
                duration: 5000,
                className: 'error-toast'
            }
        )
    }
    return (
        <CldUploadWidget
            uploadPreset="uxhibit"
            options={{
                multiple: false,
                resourceType: "image",
            }}
            onSuccess={onUploadSuccessHandler}
            onError={onUploadErrorHandler}
        >
            {({ open }) => (
                <div className="flex flex-col gap-4">
                    <h3 className="h3-bold text-dark-600">Original</h3>
                    {publicId ? (
                        <>
                            <div className="cursor-pointer overflow-hidden rounded-[10px]">
                                <CldImage
                                    width={getImageSize(type, image, "width")}
                                    height={getImageSize(type, image, "height")}
                                    src={publicId}
                                    alt="image"
                                    sizes={"(max-with: 767px) 100vwm 50vw"}
                                    placeholder={dataUrl as PlaceholderValue}
                                    className="media-uploader_cldImage"
                                />

                            </div>
                        </>
                    ) : (
                        <div className='media-uploader_cta'
                            onClick={() => open()}>
                            <div className="media-uploader_cta-image flex flex-col items-center">
                                <Image
                                    src="/assets/icons/add.svg"
                                    alt="Add Image"
                                    width={24}
                                    height={24}
                                />
                            </div>
                                <p className="p-14-medium">Click here to upload image</p>
                        </div>

                    )}
                </div>
            )}

        </CldUploadWidget>
    )
}

export default MediaUploader
