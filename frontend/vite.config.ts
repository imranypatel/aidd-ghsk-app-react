import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { ProxyOptions } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyRes', (proxyRes, _req, res) => {
            // Manually handle Set-Cookie headers to work around Vite proxy cookie issues
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              // Forward the cookie, removing any explicit domain so browser uses current origin
              const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
              const rewrittenCookies = cookies.map(cookie => 
                // Remove domain attribute from cookie
                cookie.replace(/;\s*domain=[^;]+/gi, '')
              );
              res.setHeader('set-cookie', rewrittenCookies);
            }
          });
        }
      } as ProxyOptions
    }
  }
})
