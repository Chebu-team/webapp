import MainView from './MainView'

export const metadata = {
    openGraph: {
        title: 'Next.js',
        description: 'The React Framework for the Web',
        url: 'https://nextjs.org',
        siteName: 'Next.js',
        images: [
            {
                url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEXbgyPF1s2pI9CiWKZTzdk5Mvne2pYut-GQ&s', // Must be an absolute URL
                width: 800,
                height: 600,
            },
            {
                url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEXbgyPF1s2pI9CiWKZTzdk5Mvne2pYut-GQ&s', // Must be an absolute URL
                width: 1800,
                height: 1600,
                alt: 'My custom alt',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
}

export default MainView