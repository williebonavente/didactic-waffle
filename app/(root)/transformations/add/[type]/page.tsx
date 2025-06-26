import React from 'react'
import Header from '@/components/shared/Header'
import { transformationTypes } from "@/constants";
import TransformationForm from "@/components/shared/TransformationForm";
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/lib/actions/user.action';
import { redirect } from 'next/navigation';

const AddTransformationTypePage = async ({ params }: SearchParamProps) => {

  const { userId } = await auth();
  const { type } = await params;
  const transformation = transformationTypes[type];

  if (!userId) redirect('/sign-in');

  const user = await getUserById(userId);
  return (
    <>
      <Header title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className="mt-10">

        <TransformationForm
          action="Add"
          // Passing into the real database not into clerk
          userId={user._id}
          type={transformation.type as
            TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>

    </>
  )
}

export default AddTransformationTypePage  
