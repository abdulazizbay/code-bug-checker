/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
		"./app/**/*.{js,ts,jsx,tsx}",      // for App Router
		"./pages/**/*.{js,ts,jsx,tsx}",    // if using Pages Router
		"./components/**/*.{js,ts,jsx,tsx}" // reusable components
	],
  theme: {
  	extend: {
  		colors: {
  			'blue-main': '#0DA4F5',
  			gray1: '#9C9C9C',
  			gray2: '#1D1E2D80',
  			gray3: '#636363',
  			gray4: '#88888880',
  			gray5: '#D9D9D9',
  			gray6: '#464646',
  			gray7: '#272727',
			gray8:"#7B7B7B",
  			black1: '#101010',
  			black2: '#2A2C2E',
			black3: "#0F1011",
  			blue5: '#0DA4F51A',
  			blue6: '#0DA4F51A',
  			blue7: '#489CFFCC',
  			blue8: '#009DE5',
  			blue9: '#4B87CECC',
  			customGreen: '#CDFF01',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			textShadow: {
  				custom: '0px 7px 50px rgba(13,164,245,1)'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
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
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			'10': '10px',
  			'20': '20px',
  			'100': '100px'
  		},
		screens: {
			sm: {'max': '640px'},
			md: {'max': '768px'},
			lg: {'max': '1024px'},
			xl: {'max': '1300px'},
			'2xl': '1536px',
		},
  		maxWidth: {
  			'10xl': '1512px'
  		},
  		padding: {
  			'30': '30px',
  			'50': '50px',
  			'70': '70px',
  			'100': '100px',
  			'130': '130px',
  			'150': '150px',
  			'200': '200px'
  		},
  		margin: {
  			'25': '25px',
  			'30': '30px',
  			'50': '50px',
  			'100': '100px',
  			'150': '150px',
  			'200': '200px',
  			'300': '300px'
  		},
  		width: {
  			'50': '50px',
  			'100': '100px',
  			'200': '200px',
  			'250': '250px',
  			'300': '300px',
  			'400': '400px',
  			'650': '650px',
  			'700': '700px'
  		},
  		height: {
  			'50': '50px',
  			'90': '90px',
  			'100': '100px',
  			'300': '300px',
  			'400': '400px',
  			'650': '650px'
  		},
  		gap: {
  			'50': '50px',
  			'70': '70px'
  		},
  		blur: {
  			'100': '100px',
  			'150': '150px',
  			'200': '200px',
  			'250': '250px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

