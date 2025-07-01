import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main
            className="
                flex items-center justify-center
                bg-[url('/assets/images/banner-bg.png')] bg-cover bg-center
                min-h-screen
            "
        >
            {children}
        </main>
    )
}

export default Layout;