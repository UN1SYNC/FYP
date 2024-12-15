/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverActions: {
        allowedOrigins: [
          "localhost:3000"
        ],
      },
    },
    typescript: {
      ignoreBuildErrors: true, // Ignore TypeScript errors during the build
    },
    eslint: {
      ignoreDuringBuilds: true, 
    },
    images: {
      domains: ['https://hocaqanruaizkgqriodh.supabase.co'],
    }
    
  };
  
  export default nextConfig;