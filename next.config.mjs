/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'http',
                hostname: 'magyarekszer.hu',
            },
            {
                protocol: 'http',
                hostname: 'www.magyarekszer.hu',
            },
            {
                protocol: 'https',
                hostname: 'magyarekszer.hu',
            },
            {
                protocol: 'https',
                hostname: 'www.magyarekszer.hu',
            },
        ],
    },
};

export default nextConfig;
