/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        // In production, use the BACKEND_URL provided by Vercel. 
        // In local development, fallback to localhost:8000.
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
        return [
            {
                source: "/api/:path*",
                destination: `${backendUrl}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
