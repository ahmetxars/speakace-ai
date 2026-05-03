import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://eu.i.posthog.com https://eu-assets.i.posthog.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://eu.i.posthog.com https://eu-assets.i.posthog.com https://api.resend.com wss:",
      "media-src 'self' blob:",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=()" },
          { key: "Content-Security-Policy", value: csp }
        ]
      }
    ];
  },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*"
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*"
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*"
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
