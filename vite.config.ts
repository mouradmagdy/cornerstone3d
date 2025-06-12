import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // for dicom-parser
    viteCommonjs(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // seems like only required in dev mode
  optimizeDeps: {
    exclude: ["@cornerstonejs/dicom-image-loader"],
    include: ["dicom-parser"],
  },
  worker: {
    format: "es",
  },
});
