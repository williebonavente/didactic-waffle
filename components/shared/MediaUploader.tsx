import { Toaster } from "@/components/ui/sonner"
import { CldUploadWidget, CldImage } from "next-cloudinary"
import { toast } from "sonner"
import Image from "next/image";

type MediaUploaderProps = {
    onValueChange: (value: string) => void;
    setImage: React.Dispatch<any>;
    publicId: String;
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
        toast(
            <>
                <div>Image Uploaded sucessfully</div>
                <div>1 credit was deducted from your account.</div>
            </>,
            {
                duration: 5000,
                className: 'success-toast'
            }
        )

    }

    const onUploadErrorHandler = (result: any) => {
        toast(
            <>
                <div>Something went wrong while uploading.</div>
                <div>Please try again.</div>
            </>,
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
                        Here's the image
                        </>
                    ) : (
                        <div className='media_uploader_cta flex items-center justify-center h-64 w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer' onClick={() => open()}>
                            <div className="media-uploader_cta-image flex flex-col items-center">
                                <Image
                                    src="/assets/icons/add.svg"
                                    alt="Add Image"
                                    width={24}
                                    height={24}
                                    />
                            <p className="p-14-medium text-center mt-2">Click here to upload image</p>
                            </div>
                        </div>
                        
                    )}
                </div>
            )}

        </CldUploadWidget>
    )
}

export default MediaUploader
