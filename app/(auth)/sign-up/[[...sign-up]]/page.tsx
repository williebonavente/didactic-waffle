import { SignUp } from '@clerk/nextjs'

const SignUpPage = () => {
    return (
        <SignUp
            appearance={{
                elements: {
                    // card: 'rounded-2xl shadow-lg bg-[url(/assets/images/banner-bg.png)] bg-cover',
                    formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
                    logoBox: 'flex justify-center',
                    logoImage: 'w-32 h-10 object-contain',
                },
                layout: {
                    logoImageUrl: '/logo.png',
                },
            }}
        />
    )
}

export default SignUpPage