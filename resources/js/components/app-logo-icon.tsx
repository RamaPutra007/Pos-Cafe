import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Steams */}
            <path d="M6 2v2" />
            <path d="M10 2v2" />
            <path d="M14 2v2" />
            {/* Cup Body */}
            <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
            <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
            {/* Saucer */}
            <line x1="6" x2="14" y1="1" y2="1" opacity="0" />
            <path d="M6 14h8" strokeWidth="1.5" strokeOpacity="0.5" />
        </svg>
    );
}
