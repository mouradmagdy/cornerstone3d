import { useEffect, useRef, useState } from "react";
import { init as coreInit, RenderingEngine, Enums } from "@cornerstonejs/core";
import { init as dicomImageLoaderInit } from "@cornerstonejs/dicom-image-loader";
import {
  init as cornerstoneToolsInit,
  ToolGroupManager,
  WindowLevelTool,
  StackScrollTool,
  ZoomTool,
  Enums as csToolsEnums,
  addTool,
  LengthTool,
  PanTool,
  AngleTool,
  CircleROITool,
} from "@cornerstonejs/tools";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useDicomContext } from "@/context/DicomContext";
import { useToolContext } from "@/context/ToolContext";
import toast from "react-hot-toast";
import { formatDICOMDate } from "@/helpers/formatdate";
const { ViewportType, Events } = Enums;

const CornerstoneViewer = () => {
  const [loading, setLoading] = useState(true);
  const {
    selectedSeries,
    currentIndex,
    setCurrentIndex,
    setIsDragging,
    handleDrop,
    dicomMetadata,
    uploading,
    uploadProgress,
  } = useDicomContext();

  const { activateTool, toolGroupRef, renderingEngineRef, viewportRef } =
    useToolContext();
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const renderingEngineId = "myRenderingEngine";
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
      addTool(LengthTool);
      addTool(PanTool);
      addTool(AngleTool);
      addTool(CircleROITool);
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (!toolGroup) {
        console.error("Failed to create tool group:", toolGroupId);
        return;
      }
      toolGroupRef.current = toolGroup;
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addTool(StackScrollTool.toolName, {});
      toolGroup.addTool(LengthTool.toolName);
      toolGroup.addTool(PanTool.toolName);
      toolGroup.addTool(AngleTool.toolName);
      toolGroup.addTool(CircleROITool.toolName);

      // toolGroup.setToolActive(WindowLevelTool.toolName, {
      //   bindings: [
      //     {
      //       mouseButton: csToolsEnums.MouseBindings.Primary,
      //     },
      //   ],
      // });
      // toolGroup.setToolActive(ZoomTool.toolName, {
      //   bindings: [
      //     {
      //       mouseButton: csToolsEnums.MouseBindings.Secondary,
      //     },
      //   ],
      // });
      // toolGroup.setToolActive(StackScrollTool.toolName, {
      //   bindings: [
      //     {
      //       mouseButton: csToolsEnums.MouseBindings.Wheel,
      //     },
      //   ],
      // });

      // Initialize rendering engine
      const renderingEngine = new RenderingEngine(renderingEngineId);
      renderingEngineRef.current = renderingEngine;
      const viewportElement = viewportRef.current;

      // Set up viewport
      toolGroup.addViewport(viewportId, renderingEngineId);

      renderingEngine.enableElement({
        viewportId,
        type: ViewportType.STACK,
        element: viewportElement,
        defaultOptions: {},
      });

      viewportElement.addEventListener(Events.CAMERA_MODIFIED, () => {
        const viewport = renderingEngine.getViewport(viewportId);
        if (viewport) {
          const zoom = viewport.getZoom();
          setZoomLevel(Math.round(zoom * 100));
        }
      });

      const handleStackScroll = (e) => {
        const viewport = renderingEngineRef.current.getViewport(viewportId);
        const currentImageIndex = viewport.getCurrentImageIdIndex();
        setCurrentIndex(currentImageIndex);
      };

      viewportElement.addEventListener(
        csToolsEnums.Events.MOUSE_WHEEL,
        handleStackScroll
      );

      setLoading(false);
    };

    initCornerstone();
  }, [setCurrentIndex, toolGroupRef, renderingEngineRef, viewportRef]);

  useEffect(() => {
    // if (!selectedSeries) {
    //   toolGroupRef.current.setToolPassive(StackScrollTool.toolName);
    // }
    if (selectedSeries && renderingEngineRef.current) {
      const renderingEngine = renderingEngineRef.current;
      if (!renderingEngine) {
        console.error("Rendering engine is not initialized.");
        return;
      }
      const viewport = renderingEngine.getViewport(viewportId);
      if (!viewport) {
        console.error("Viewport is not initialized.");
        return;
      }
      const imageIds = selectedSeries.images.map((img) => img.imageId);
      viewport.setZoom(zoomLevel / 100);

      const cacheSize = Math.min(
        100,
        Math.floor(selectedSeries.images.length / 2)
      );
      viewport.setStack(imageIds, currentIndex, {
        cacheSize,
      });

      toolGroupRef.current.setToolActive(WindowLevelTool.toolName, {
        bindings: [
          {
            mouseButton: csToolsEnums.MouseBindings.Primary,
          },
        ],
      });
      toolGroupRef.current.setToolActive(ZoomTool.toolName, {
        bindings: [
          {
            mouseButton: csToolsEnums.MouseBindings.Secondary,
          },
        ],
      });

      toolGroupRef.current.setToolActive(StackScrollTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }],
      });
      viewport.render();
    }
  }, [
    selectedSeries,
    currentIndex,
    zoomLevel,
    renderingEngineRef,
    toolGroupRef,
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedSeries) return;
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
      if (
        e.key === "ArrowRight" &&
        currentIndex < selectedSeries.images.length - 1
      ) {
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, setCurrentIndex, selectedSeries]);

  useEffect(() => {
    if (!selectedSeries) {
      setMetadata(null);
      return;
    }
    const studyUID = selectedSeries.studyUID;
    const meta = dicomMetadata[studyUID];
    if (!meta) {
      toast.error(`No metadata found for study UID: ${studyUID}`);
      setMetadata(null);
      return;
    }
    setMetadata(meta);
  }, [dicomMetadata, selectedSeries]);

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
    <div className="flex relative w-full h-full">
      <Dialog open={uploading}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Upload className="text-blue-700 w-5 h-5" />
                Uploading DICOM files
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="w-[60%]">
            <Progress value={uploadProgress} />
          </div>
        </DialogContent>
      </Dialog>

      <div
        ref={viewportRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className="w-full h-full  relative overflow-hidden border-1 border-blue-700 rounded-xl"
      >
        {selectedSeries && (
          <div className="absolute text-sm top-2 left-2 text-white bg-opacity-50 px-2 py-1 rounded z-10">
            I:{currentIndex + 1} ({currentIndex + 1}/
            {selectedSeries?.images.length})
          </div>
        )}
        {selectedSeries && (
          <div className="flex items-center absolute top-2 right-2 z-10">
            <button className=" p-2 bg-opacity-50 hover:bg-opacity-75 rounded text-white">
              <ChevronLeft
                onClick={() => {
                  if (currentIndex > 0) {
                    setCurrentIndex((prev) => prev - 1);
                  }
                }}
                className="w-5 h-5 cursor-pointer"
              />
            </button>
            <button className=" p-2 bg-opacity-50 hover:bg-opacity-75 rounded text-white">
              <ChevronRight
                onClick={() => {
                  if (
                    selectedSeries &&
                    currentIndex < selectedSeries.images.length - 1
                  ) {
                    setCurrentIndex((prev) => prev + 1);
                  }
                }}
                className="w-5 h-5 cursor-pointer"
              />
            </button>
          </div>
        )}
        {metadata && (
          <div className="absolute flex flex-col top-10 text-sm left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded z-10">
            <span className="z-10 text-blue-700">
              <span className="text-white">Patient Name: </span>
              {metadata.patientName}
            </span>
            <span className="z-10 text-blue-700">
              <span className="text-white">Patient ID: </span>
              {metadata.patientId}
            </span>
            <span className="z-10 text-blue-700">
              <span className="text-white">Study Date: </span>
              {formatDICOMDate(metadata.studyDate)}
            </span>
          </div>
        )}
        {selectedSeries && (
          <div className="absolute bottom-3 text-sm left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded z-10">
            Zoom: {(zoomLevel / 100).toFixed(2)}x{" "}
          </div>
        )}
        {metadata && (
          <div className="absolute top-10 text-sm right-2 flex flex-col text-white  bg-opacity-50 px-2 py-1 rounded z-10">
            <span className="z-10 text-blue-700">
              <span className="text-white">Modality: </span>
              {metadata.modality}
            </span>
            <span className="z-10 text-blue-700">
              <span className="text-white">Gender </span>
              {metadata.gender}
            </span>
          </div>
        )}
        {!selectedSeries && (
          <div className="absolute top-72 right-96 z-10 flex flex-col items-center justify-center">
            <span className="text-blue-700 text-lg">
              No DICOM files selected. Please upload DICOM files via the upload
              buttons
            </span>
            <span className="text-blue-700 text-lg">
              {" "}
              or you can drag and drop files.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CornerstoneViewer;
