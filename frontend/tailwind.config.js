/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Nunito'],
      },
      keyframes: {
        'heartbeat-3': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'heartbeat-2': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        'heartbeat-1': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        dangerPulse: {
          '0%, 100%': {
            boxShadow: '0 0 30px rgba(220, 38, 38, 0.2) inset, 0 0 50px rgba(185, 28, 28, 0.15), 0 0 75px rgba(153, 27, 27, 0.1)',
            backgroundColor: 'rgba(127, 29, 29, 0.02)'
          },
          '50%': {
            boxShadow: '0 0 50px rgba(220, 38, 38, 0.3) inset, 0 0 75px rgba(185, 28, 28, 0.25), 0 0 100px rgba(153, 27, 27, 0.2)',
            backgroundColor: 'rgba(127, 29, 29, 0.05)'
          }
        }
      },
      animation: {
        'heartbeat-3': 'heartbeat-3 0.6s infinite',
        'heartbeat-2': 'heartbeat-2 0.4s infinite',
        'heartbeat-1': 'heartbeat-1 0.3s infinite',
        'danger-pulse': 'dangerPulse 3s ease-in-out infinite'
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

