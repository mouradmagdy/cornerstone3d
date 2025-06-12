import { useEffect, useRef, useState } from "react";
import dicomParser from "dicom-parser";
import { init as coreInit, RenderingEngine, Enums } from "@cornerstonejs/core";
import {
  init as dicomImageLoaderInit,
  wadouri,
} from "@cornerstonejs/dicom-image-loader";
import {
  init as cornerstoneToolsInit,
  ToolGroupManager,
  WindowLevelTool,
  StackScrollTool,
  ZoomTool,
  Enums as csToolsEnums,
  addTool,
} from "@cornerstonejs/tools";
const { ViewportType } = Enums;

const CornerstoneViewer = () => {
  const [loading, setLoading] = useState(true);
  const [imageIds, setImageIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const renderingEngineId = "myRenderingEngine";
  const renderingEngineRef = useRef(null);
  const viewportRef = useRef(null);
  const initializedRef = useRef(false);
  const viewportId = "myViewport";
  const toolGroupId = "myToolGroup";

  useEffect(() => {
    const initCornerstone = async () => {
      if (initializedRef.current) {
        return;
      }
      initializedRef.current = true;
      // Initialize Cornerstone3D and tools
      coreInit();
      cornerstoneToolsInit();
      dicomImageLoaderInit();

      // Add tools
      addTool(WindowLevelTool);
      addTool(ZoomTool);
      addTool(StackScrollTool);
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (!toolGroup) {
        console.error("Failed to create tool group:", toolGroupId);
        return;
      }
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addTool(StackScrollTool.toolName);
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [
          {
            mouseButton: csToolsEnums.MouseBindings.Primary, // Left Click
          },
        ],
      });
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [
          {
            mouseButton: csToolsEnums.MouseBindings.Secondary, // Right Click
          },
        ],
      });
      toolGroup.setToolActive(StackScrollTool.toolName, {
        bindings: [
          {
            mouseButton: csToolsEnums.MouseBindings.Wheel, // Mouse Wheel
          },
        ],
      });

      // Initialize rendering engine
      const renderingEngine = new RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;
      const viewportElement = viewportRef.current;
      viewportElement.style.width = "500px";
      viewportElement.style.height = "500px";

      // Set up viewport
      toolGroup.addViewport(viewportId, renderingEngineId);

      renderingEngine.enableElement({
        viewportId,
        type: ViewportType.STACK,
        element: viewportElement,
        defaultOptions: {},
      });

      setLoading(false);
    };

    initCornerstone();
  }, []);

  useEffect(() => {
    if (imageIds.length > 0 && renderingEngineRef.current) {
      const renderingEngine = renderingEngineRef.current;
      const viewport = renderingEngine.getViewport(viewportId);
      viewport.setStack(imageIds, currentIndex);
      viewport.render();
    }
  }, [imageIds, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
      if (e.key === "ArrowRight" && currentIndex < imageIds.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, imageIds]);

  const handleFileUpload = async (files) => {
    const parsedFiles = [];
    const fileArray = Array.from(files);
    for (const file of fileArray) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const byteArray = new Uint8Array(arrayBuffer);
        const dataset = dicomParser.parseDicom(byteArray);
        const instanceNumber = dataset.intString("x00200013") || 0; // InstanceNumber
        const imageId = wadouri.fileManager.add(file);
        parsedFiles.push({ imageId, instanceNumber });
      } catch (error) {
        console.error("Error processing file:", file.name, error);
      }
    }
    parsedFiles.sort((a, b) => a.instanceNumber - b.instanceNumber);
    const newImageIds = parsedFiles.map((item) => item.imageId);
    setImageIds(newImageIds);
  };

  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   const files = e.dataTransfer.files;
  //   if (files.length > 0) {
  //     handleFileUpload(files);
  //   }
  // };
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
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDragEnter = (e) => {
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    setIsDragging(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        zIndex: 1,
        border: isDragging ? "2px dashed blue" : "2px dashed #ccc",
        backgroundColor: isDragging ? "#f0f8ff" : "transparent",
        // backgroundColor: "#f9f9f9",
      }}
    >
      {loading && <p>Loading Cornerstone...</p>}
      <input
        type="file"
        accept=".dcm,image/dicom"
        multiple
        onChange={handleFileInput}
        style={{ marginBottom: "10px" }}
        webkitdirectory="true"
      />
      <p>Drag and drop DICOM files here or click to upload.</p>
      <div ref={viewportRef} style={{ width: "100%", height: "500px" }} />
    </div>
  );
};

export default CornerstoneViewer;
