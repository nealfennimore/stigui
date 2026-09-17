import { execSync } from 'child_process';
import type { NextConfig } from 'next';

/**
 * One id per build. The service worker registers as `/sw.js?v=<id>`,
 * so every deploy installs a fresh worker with its own cache and drops
 * the previous build's cache on activation.
 */
const buildId = (() => {
    const fromCI = process.env.GITHUB_SHA?.slice(0, 12);
    if (fromCI) {
        return fromCI;
    }
    try {
        return execSync('git rev-parse --short=12 HEAD', {
            stdio: ['ignore', 'pipe', 'ignore'],
        })
            .toString()
            .trim();
    } catch {
        return Date.now().toString(36);
    }
})();

const nextConfig: NextConfig = {
    output: 'export',
    generateBuildId: () => buildId,
    env: {
        NEXT_PUBLIC_BUILD_ID: buildId,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
