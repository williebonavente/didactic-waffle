import Sidebar  from '@/components/shared/Sidebar'
import MobileNav from "@/components/shared/MobileNav"
import { Toaster } from '@/components/ui/sonner'

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="root">
            <Sidebar/>
            <Toaster />
            <MobileNav />
            <div className="root-container">
                <div className="wrapper">
                    { children }
                </div>
            </div>
        </main>
    )
}


export default Layout;