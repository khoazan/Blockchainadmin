import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Thêm cấu hình alias và define để fix lỗi Buffer trong ethers.js
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      buffer: "buffer",
      process: "process/browser",
    },
  },
  define: {
    global: "globalThis",
  },
});
