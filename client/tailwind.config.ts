/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'brutal': '4px 4px 0 0 rgba(0, 0, 0, 1)',
  			'brutal-sm': '2px 2px 0 0 rgba(0, 0, 0, 1)',
  			'brutal-lg': '6px 6px 0 0 rgba(0, 0, 0, 1)',
  			'brutal-xl': '8px 8px 0 0 rgba(0, 0, 0, 1)',
  			'brutal-2xl': '12px 12px 0 0 rgba(0, 0, 0, 1)',
  			'brutal-black': '4px 4px 0 0 rgba(0, 0, 0, 1)',
  			'brutal-purple': '4px 4px 0 0 rgba(147, 51, 234, 1)',
  			'brutal-blue': '4px 4px 0 0 rgba(59, 130, 246, 1)',
  			'brutal-cyan': '4px 4px 0 0 rgba(34, 211, 238, 1)',
  			'brutal-green': '4px 4px 0 0 rgba(34, 197, 94, 1)',
  		},
  		fontFamily: {
  			sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'gradient': 'gradient 6s linear infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' },
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' },
  			},
  			'gradient': {
  				'0%, 100%': {
  					'background-size': '200% 200%',
  					'background-position': 'left center',
  				},
  				'50%': {
  					'background-size': '200% 200%',
  					'background-position': 'right center',
  				},
  			},
  			'shimmer': {
  				'0%': {
  					'background-position': '-1000px 0',
  				},
  				'100%': {
  					'background-position': '1000px 0',
  				},
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} as const;

export default config; 