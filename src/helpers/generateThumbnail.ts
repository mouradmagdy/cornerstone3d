import type { Series } from "@/types/types";
import { imageLoader } from "@cornerstonejs/core";

export const generateThumbnail = async (imageId: string, series: Series) => {
  try {
    const image = await imageLoader.loadAndCacheImage(imageId);
    const pixelData = image.getPixelData();
    if (!pixelData) {
      console.warn(`No pixel data for thumbnail: ${imageId}`);
      return null;
    }

    const rows = image.rows || 100;
    const columns = image.columns || 100;
    const photometricInterpretation =
      image.photometricInterpretation || "MONOCHROME2";
    let windowCenter: number = Array.isArray(image.windowCenter)
      ? image.windowCenter[0]
      : image.windowCenter ?? 0;
    let windowWidth: number = Array.isArray(image.windowWidth)
      ? image.windowWidth[0]
      : image.windowWidth ?? 1;

    if (typeof windowCenter === "string")
      windowCenter = parseFloat(windowCenter);
    if (typeof windowWidth === "string") windowWidth = parseFloat(windowWidth);

    if (!rows || !columns) {
      console.warn(`Invalid dimensions for image: ${imageId}`);
      return null;
    }
    const minPixelValue: number = windowCenter - windowWidth / 2;
    const maxPixelValue: number = windowCenter + windowWidth / 2;
    const range: number = maxPixelValue - minPixelValue || 1;

    const thumbnailSize = 100;
    const aspectRatio = columns / rows;
    const canvasWidth =
      aspectRatio >= 1 ? thumbnailSize : thumbnailSize * aspectRatio;
    const canvasHeight =
      aspectRatio >= 1 ? thumbnailSize / aspectRatio : thumbnailSize;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(canvasWidth);
    canvas.height = Math.round(canvasHeight);
    const ctx = canvas.getContext("2d")!;
    const imgData = ctx.createImageData(canvas.width, canvas.height);

    const scaleX = columns / canvas.width;
    const scaleY = rows / canvas.height;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const srcIdx = srcY * columns + srcX;
        const dstIdx = (y * canvas.width + x) * 4;

        let value = pixelData[srcIdx] || 0;
        value = Math.max(minPixelValue, Math.min(maxPixelValue, value));
        const normalized = ((value - minPixelValue) / range) * 255;
        const finalValue =
          photometricInterpretation === "MONOCHROME1"
            ? 255 - normalized
            : normalized;

        imgData.data[dstIdx] =
          imgData.data[dstIdx + 1] =
          imgData.data[dstIdx + 2] =
            finalValue;
        imgData.data[dstIdx + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(imgData, 0, 0);
    series.thumbnail = canvas.toDataURL("image/jpeg", 0.8);
    return series.thumbnail;
  } catch (err) {
    console.error(`Failed to generate thumbnail for ${imageId}:`, err);
    return null;
  }
};
