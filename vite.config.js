import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // تم تطبيق React.lazy سابقًا. بقيت courseContent كبيرة لأنها ملف محتوى تعليمي ضخم ومحمّل عند فتح الرحلة فقط.
    // نرفع حد التحذير حتى لا يضلل Cloudflare بعد التقسيم، بدون تعطيل البناء أو تغيير المحتوى.
    chunkSizeWarningLimit: 1500
  }
});
