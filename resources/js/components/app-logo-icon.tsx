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
            <path d="M18.5 5.5a7 7 0 0 0-9.9 0L4.8 9.3a7 7 0 0 0 9.9 9.9l3.8-3.8a7 7 0 0 0 0-9.9z" />
            <path d="M8.5 8.5c1.5 1.5 2.5 3.5 2.5 5.5s1 4 2.5 5.5" />
        </svg>
    );
}
