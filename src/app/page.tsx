import MainView from './MainView'
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Chebu",
    description: "Chebu - legendary coin return",
    twitter: { card: "summary_large_image", site: "@site", creator: "@creator", images: "https://res.cloudinary.com/dnb0lohxk/image/upload/fl_preserve_transparency/v1719206411/cheba_2_dfaxdq.jpg?_s=public-apps" },
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: {
        title: 'Chebu',
        description: 'Chebu - legendary coin return',
        url: 'https://chebu.vercel.app/',
        siteName: 'Chebu',
        images: [
            {
                url: 'https://res.cloudinary.com/dnb0lohxk/image/upload/fl_preserve_transparency/v1719206411/cheba_2_dfaxdq.jpg?_s=public-apps', // Must be an absolute URL
                width: 800,
                height: 600,
                alt: 'My custom alt',
            }
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default MainView