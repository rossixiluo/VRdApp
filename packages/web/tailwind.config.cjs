/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,tsx,jsx}", 
  "../../packages/ui-components/**/*.{js,ts,jsx,tsx}",
  "./node_modules/flowbite/**/*.js"
],
  theme: {
    extend: {
      colors:{
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
        "valuerouter-primary":"rgba(52,64,84)",
        "valuerouter-layers-2":"rgba(249,250,251)",
        "valuerouter-secondary":"rgba(102,112,133)",
        "valuerouter-tag-purple":"rgba(29, 78 ,216)",
        "valuerouter-switch":"rgba(29,41,57)",
     
        
      }
    },
    fontFamily:{
      'body':['Open Sans', 
              'ui-sans-serif', 
              'system-ui', 
              '-apple-system', 
              'system-ui', 
              'Segoe UI', 
              'Roboto', 
              'Helvetica Neue', 
              'Arial', 
              'Noto Sans', 
              'sans-serif', 
              'Apple Color Emoji', 
              'Segoe UI Emoji', 
              'Segoe UI Symbol', 
              'Noto Color Emoji'],
  
    },
    container: {
      
      screens: {
        
        "2xl": "1905px",
      },
    },
    
    
  },
  plugins: [],
}
