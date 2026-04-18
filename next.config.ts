import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: false
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }
        ]
      }
    ];
  },
  async redirects() {
    return [
      {
        source: "/blog/hometown-questions",
        destination: "/blog/how-to-answer-ielts-speaking-part-1-hometown-questions-more-naturally",
        permanent: true
      },
      {
        source: "/blog/ielts-hometown-questions",
        destination: "/blog/how-to-answer-ielts-speaking-part-1-hometown-questions-more-naturally",
        permanent: true
      },
      {
        source: "/blog/work-and-study-questions",
        destination: "/blog/how-to-answer-ielts-speaking-part-1-work-and-study-questions-clearly",
        permanent: true
      },
      {
        source: "/blog/useful-object-cue-card",
        destination: "/blog/how-to-improve-useful-object-cue-card-answers-in-ielts-speaking",
        permanent: true
      },
      {
        source: "/blog/person-cue-card",
        destination: "/blog/how-to-describe-a-person-better-in-ielts-speaking-part-2",
        permanent: true
      },
      {
        source: "/blog/place-cue-card",
        destination: "/blog/how-to-describe-a-place-more-clearly-in-ielts-speaking-part-2",
        permanent: true
      },
      {
        source: "/blog/ielts-part-3-opinion-answers",
        destination: "/blog/how-to-give-stronger-opinion-answers-in-ielts-speaking-part-3",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
