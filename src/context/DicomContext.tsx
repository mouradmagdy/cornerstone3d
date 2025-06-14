import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import dicomParser from "dicom-parser";
import { wadouri } from "@cornerstonejs/dicom-image-loader";
import { imageLoader } from "@cornerstonejs/core";
interface DicomContextType {
  studies: any[];
  setStudies: (studies: any[]) => void;
  selectedSeries: any;
  handleSeriesSelect: (series: any) => void;
  selectedSeriesUID: string | null;
}
const DicomContext = createContext<DicomContextType | undefined>(undefined);
interface DicomProviderProps {
  children: ReactNode;
}
export const DicomProvider: React.FC<DicomProviderProps> = ({ children }) => {
  const [studies, setStudies] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dicomMetadata, setDicomMetadata] = useState<{ [key: string]: any }>(
    {}
  );

  const handleSeriesSelect = (series) => {
    setSelectedSeries(series);
    setCurrentIndex(0);
  };

  const generateThumbnail = async (imageId: string, series: Series) => {
    try {
      const image = await imageLoader.loadAndCacheImage(imageId);
      const pixelData = image.getPixelData();
      if (!pixelData) {
        console.warn(`No pixel data for thumbnail: ${imageId}`);
        return;
      }

      // Use cornerstone metadata provider to get image pixel module
      const imagePixelModule = (window as any).cornerstone?.metaData?.get?.(
        "imagePixelModule",
        imageId
      );
      const { rows, columns, photometricInterpretation } = imagePixelModule || {
        rows: 100,
        columns: 100,
        photometricInterpretation: "MONOCHROME2",
      };

      // Normalize pixel data for better contrast
      let min = pixelData[0],
        max = pixelData[0];
      for (let i = 0; i < pixelData.length; i++) {
        min = Math.min(min, pixelData[i]);
        max = Math.max(max, pixelData[i]);
      }

      const range = max - min || 1;

      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      const imgData = ctx.createImageData(100, 100);
      const scaleX = columns / 100;
      const scaleY = rows / 100;

      // Populate image data (simplified for example)
      for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
          const i = (y * 100 + x) * 4;
          const value =
            pixelData[
              Math.floor(y * scaleY) * columns + Math.floor(x * scaleX)
            ];
          imgData.data[i] = ((value - min) / range) * 255; // R
          imgData.data[i + 1] = ((value - min) / range) * 255; // G
          imgData.data[i + 2] = ((value - min) / range) * 255; // B
          imgData.data[i + 3] = 255; // A
        }
      }

      ctx.putImageData(imgData, 0, 0);
      return canvas.toDataURL();
    } catch (error) {
      console.error(`Error generating thumbnail for ${imageId}:`, error);
      return null;
    }
  };

  const selectedSeriesUID = selectedSeries?.seriesUID;

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    if (totalFiles === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const studyMap = new Map();

    try {
      const metadata = {};
      for (let i = 0; i < totalFiles; i++) {
        const file = fileArray[i];
        const arrayBuffer = await file.arrayBuffer();
        const byteArray = new Uint8Array(arrayBuffer);
        const dataset = dicomParser.parseDicom(byteArray);
        const transferSyntaxUID = dataset.string("x00020010");
        const studyUID = dataset.string("x0020000d"); // study
        const seriesUID = dataset.string("x0020000e"); // series
        const instanceNumber = dataset.intString("x00200013") || 0; // InstanceNumber
        const seriesDescription =
          dataset.string("x0008103e") || `Series ${seriesUID.slice(-8)}`;
        const seriesNumber = dataset.intString("x00200011") || 0;
        const patientName = dataset.string("x00100010") || "Unknown";
        const patientId = dataset.string("x00100020") || "Unknown";
        const gender = dataset.string("x00100040") || "Unknown";
        const modality = dataset.string("x00080060") || "Unknown";
        if (!transferSyntaxUID) {
          console.warn(`No transfer syntax found for file: ${file.name}`);
          continue;
        }

        if (!studyUID || !seriesUID) {
          console.warn(`Missing Study or Series UID for file: ${file.name}`);
          continue;
        }

        const imageId = wadouri.fileManager.add(file);
        if (!studyMap.has(studyUID)) {
          studyMap.set(studyUID, {
            studyUID,
            studyDescription:
              dataset.string("x00081030") || `Study ${studyUID.slice(-8)}`,
            seriesMap: new Map(),
          });
        }
        const study = studyMap.get(studyUID);
        if (!study.seriesMap.has(seriesUID)) {
          study.seriesMap.set(seriesUID, {
            studyUID,
            seriesUID,
            seriesDescription,
            seriesNumber,
            images: [],
            thumbnail: null,
          });
        }
        const series = study.seriesMap.get(seriesUID);
        series.images.push({ imageId, instanceNumber });

        if (!metadata[studyUID]) {
          metadata[studyUID] = {
            patientName,
            patientId,
            gender,
            modality,
          };
        }

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      for (const study of studyMap.values()) {
        for (const series of study.seriesMap.values()) {
          if (series.images.length > 0) {
            const firstImageId = series.images[0].imageId;
            const thumbnailDataUrl = await generateThumbnail(firstImageId, {
              studyUID: study.studyUID,
              seriesUID: series.seriesUID,
              imageId: firstImageId,
            });
            series.thumbnail = thumbnailDataUrl;
          }
        }
      }

      const newStudies = Array.from(studyMap.values()).map((study) => ({
        ...study,
        series: Array.from(study.seriesMap.values()).map((series) => ({
          ...(series as object),
          images: series.images.sort(
            (a, b) => a.instanceNumber - b.instanceNumber
          ),
        })),
      }));
      setStudies((prevStudies) => {
        const updatedStudies = [...prevStudies];
        newStudies.forEach((newStudy) => {
          const existingStudyIndex = updatedStudies.findIndex(
            (s) => s.studyUID === newStudy.studyUID
          );
          if (existingStudyIndex >= 0) {
            newStudy.series.forEach((newSeries) => {
              const existingSeriesIndex = updatedStudies[
                existingStudyIndex
              ].series.findIndex((s) => s.seriesUID === newSeries.seriesUID);
              if (existingSeriesIndex >= 0) {
                updatedStudies[existingSeriesIndex].series[
                  existingSeriesIndex
                ].images = [
                  ...updatedStudies[existingSeriesIndex].series[
                    existingSeriesIndex
                  ].images,
                  ...newSeries.images,
                ].sort((a, b) => a.instanceNumber - b.instanceNumber);
              } else {
                updatedStudies[existingStudyIndex].series.push(newSeries);
              }
            });
          } else {
            updatedStudies.push(newStudy);
          }
        });
        return updatedStudies;
      });
      setDicomMetadata((prevMetadata) => ({
        ...prevMetadata,
        ...metadata,
      }));
      if (
        !selectedSeries &&
        newStudies.length > 0 &&
        newStudies[0].series.length > 0
      ) {
        handleSeriesSelect(newStudies[0].series[0]);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error processing file:", file.name, error);
    } finally {
      setUploading(false);
      // setUploadProgress(100);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();

    const items = e.dataTransfer.items;
    const files = [];

    const readEntries = async (entry) => {
      return new Promise((resolve) => {
        if (entry.isFile) {
          entry.file((file) => {
            files.push(file);
            resolve();
          });
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          dirReader.readEntries(async (entries) => {
            for (const ent of entries) {
              await readEntries(ent);
            }
            resolve();
          });
        }
      });
    };

    const readAllEntries = async () => {
      const promises = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry?.();
        if (entry) {
          promises.push(readEntries(entry));
        }
      }
      await Promise.all(promises);
      return files;
    };

    const allFiles = await readAllEntries();

    if (allFiles.length > 0) {
      handleFileUpload(allFiles);
    } else {
      console.warn("No files found in dropped folder");
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };
  return (
    <DicomContext.Provider
      value={{
        studies,
        setStudies,
        selectedSeries,
        handleSeriesSelect,
        selectedSeriesUID,
        currentIndex,
        setCurrentIndex,
        uploading,
        handleFileUpload,
        handleFileInput,
        isDragging,
        setIsDragging,
        handleDrop,
        dicomMetadata,
        uploadProgress,
        // activateTool,
      }}
    >
      {children}
    </DicomContext.Provider>
  );
};

export const useDicomContext = () => {
  const context = useContext(DicomContext);
  if (!context) {
    throw new Error("useDicomContext must be used within a DicomProvider");
  }
  return context;
};
