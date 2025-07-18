"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod";
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants";
import { CustomField } from "./CustomField";
import { useEffect, useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { updateCredits } from "@/lib/actions/user.action";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/lib/actions/image.action";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";

export const formSchema = z.object({
    // Field forms
    title: z.string(),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt: z.string().optional(),
    publicId: z.string(),
    hidden: z.boolean().optional(),
})

const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }:
    TransformationFormProps) => {

    const transformationType = transformationTypes[type];
    const [image, setImage] = useState(data);
    const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
    // for submission handling
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTransforming, setIsTransforming] = useState(false);
    const [transformationConfig, setTransformationConfig] = useState(config);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const initialValues = data && action === 'Update' ? {
        title: data?.title,
        aspectRatio: data?.aspectRatio,
        color: data?.color,
        prompt: data?.prompt,
        publicId: data?.publicId,
        // TODO: Hidden values
        hidden: data?.hidden ?? false,
    } : { ...defaultValues, hidden: false };
    // 1. Define the form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,
    })

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        setIsSubmitting(true);
        if (data || image) {
            const transformationUrl = getCldImageUrl({
                width: image?.width,
                height: image?.height,
                src: image?.publicId,
                ...transformationConfig
            })

            const imageData = {
                title: values.title,
                publicId: image?.publicId,
                transformationType: type,
                width: image?.width,
                height: image?.height,
                config: transformationConfig,
                secureURL: image?.secureURL,
                transformationURL: transformationUrl,
                aspectRatio: values.aspectRatio,
                prompt: values.prompt,
                color: values.color,
            }

            if (action === 'Add') {
                try {
                    const newImage = await addImage({
                        image: imageData,
                        userId,
                        path: '/'
                    })

                    if (newImage) {
                        form.reset()
                        setImage(data)
                        router.push(`/transformations/${newImage._id}`)
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            if (action === 'Update') {
                try {
                    const updatedImage = await updateImage({
                        image: {
                            ...imageData,
                            _id: data._id
                        },
                        userId,
                        path: `/transformations/${data._id}`
                    })

                    if (updatedImage) {
                        router.push(`/transformations/${updatedImage._id}`)
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        setIsSubmitting(false);
    }


    const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {

        const imageSize = aspectRatioOptions[value as AspectRatioKey]
        setImage((prevState: any) => ({
            ...prevState,
            aspectRatio: imageSize.aspectRatio,
            width: imageSize.width,
            height: imageSize.height,

        }))

        setNewTransformation(transformationType.config);

        return onChangeField(value);
    }

    const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
        debounce(() => {
            setNewTransformation((prevState: any) => ({
                ...prevState,
                [type]: {
                    ...prevState?.[type],
                    [fieldName === 'prompt' ? 'prompt' : 'to']: value
                }
            }))

        }, 1000)()
        return onChangeField(value);
    }

    // TODO:  Update creditFee to something else 
    const onTransformHandler = async () => {
        setIsTransforming(true)

        setTransformationConfig(
            deepMergeObjects(newTransformation, transformationConfig)
        )
        setNewTransformation(null)

        startTransition(async () => {
            await updateCredits(userId, creditFee);
        })
    }

    useEffect(() => {
        if (image && (type === 'restore' || type === 'removeBackground')) {
            setNewTransformation(transformationType.config);
        }
    }, [image, transformationType.config, type])
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8">
                {/* Forms for credits */}
                {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
                {/* Custom Form */}
                <CustomField
                    control={form.control}
                    name="title"
                    formLabel="Image Title"
                    className="w-full"
                    render={({ field }) => <Input {...field}
                        className="input-field"
                        required
                    />}
                />
                {/* Hide functionality  */}
                {/* <CustomField
                    control={form.control}
                    name="hidden"
                    formLabel="Hide this image from homepage"
                    className="w-full"
                    render={({ field }) => (
                        <Input
                            type="checkbox"
                            checked={field.value}
                            onChange={e => field.onChange(e.target.checked)}
                            className="mr-2"
                        />
                    )}
                /> */}
                {type === 'fill' && (
                    <CustomField
                        control={form.control}
                        name="aspectRatio"
                        formLabel="Aspect Ratio"
                        className="w-full"
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) =>
                                    onSelectFieldHandler(value, field.onChange)}
                                value={field.value}
                                required={true}
                            >
                                <SelectTrigger className="select-field">
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Insert another field in the constant do not hard code another field!! */}
                                    {Object.keys(aspectRatioOptions).map((key) => (
                                        <SelectItem key={key} value={key} className="select-item">
                                            {aspectRatioOptions[key as AspectRatioKey].label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                )}

                {(type === 'remove' || type === 'recolor') && (
                    <div className="prompt-field">
                        <CustomField
                            control={form.control}
                            name="prompt"
                            formLabel={
                                type === 'remove' ? 'Object to remove' : 'Object to recolor'
                            }
                            className="w-full"
                            render={({ field }) => (
                                <Input
                                    value={field.value}
                                    className="input-field"
                                    onChange={(e) => onInputChangeHandler(
                                        'prompt',
                                        e.target.value,
                                        type,
                                        field.onChange
                                    )}
                                />
                            )}
                        />

                        {type === 'recolor' && (
                            <CustomField
                                control={form.control}
                                name="color"
                                formLabel="Replacement Color"
                                className="w-full"
                                render={({ field }) => (
                                    <Input value={field.value}
                                        className="input-field"
                                        onChange={(e) => onInputChangeHandler(
                                            'color',
                                            e.target.value,
                                            'recolor',
                                            field.onChange
                                        )}
                                    />
                                )}
                            />
                        )}
                    </div>
                )}

                <div className="media-uploader-field">


                    <CustomField
                        control={form.control}
                        name="publicId"
                        className="flex size-full flex-col"
                        render={({ field }) => (
                            <MediaUploader
                                onValueChange={field.onChange}
                                setImage={setImage}
                                publicId={field.value}
                                image={image}
                                type={type}
                            />
                        )}
                    />

                    <TransformedImage
                        image={image}
                        type={type}
                        title={form.getValues().title}
                        isTransforming={isTransforming}
                        setIsTransforming={setIsTransforming}
                        transformationConfig={transformationConfig}
                    />

                </div>
                <div className="flex flex-col gap-4">
                    {/* Show error if no image is uploaded */}
                    <Button
                        type="button"
                        className="submit-button capitalize"
                        disabled={isTransforming ||
                            newTransformation === null ||
                            !image || !image.publicId
                        }
                        onClick={onTransformHandler}
                    >
                        {isTransforming ? 'Transforming...' : 'Apply Transformation'}
                    </Button>
                    <Button
                        className="submit-button capitalize"
                        disabled={isSubmitting || isTransforming ||
                            !image?.publicId || !transformationConfig
                        }
                        type="submit">{isSubmitting ? 'Submitting' : 'Save Image'}</Button>
                </div>
            </form>
        </Form>
    )
}

export default TransformationForm
