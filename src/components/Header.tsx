import { useDicomContext } from "@/context/DicomContext";
import {
  Ban,
  Camera,
  Circle,
  FileUp,
  FolderUp,
  Maximize2,
  Minimize2,
  Move,
  RotateCcw,
  Ruler,
  Search,
  TriangleRight,
} from "lucide-react";

import {
  WindowLevelTool,
  ZoomTool,
  LengthTool,
  PanTool,
  annotation,
  AngleTool,
  CircleROITool,
} from "@cornerstonejs/tools";
import { useToolContext } from "@/context/ToolContext";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const Header = () => {
  const { uploading, handleFileInput } = useDicomContext();
  const {
    activateTool,
    toolGroupRef,
    resetViewport,
    activeTool,
    renderingEngineRef,
    viewportRef,
  } = useToolContext();

  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!document.fullscreenElement;
      setIsFullScreen(isCurrentlyFullScreen);
      if (renderingEngineRef.current) {
        const viewport = renderingEngineRef.current.getViewport("myViewport");
        if (viewport) {
          viewport.resetCamera();
          viewport.render();
        }
      }
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  });

  const handleFullScreenToggle = async () => {
    if (!viewportRef.current) {
      toast.error("Viewport is not available.");
      return;
    }
    try {
      if (!isFullScreen) {
        await viewportRef.current.requestFullscreen();
        setIsFullScreen(true);
        if (renderingEngineRef.current) {
          const viewport = renderingEngineRef.current.getViewport("myViewport");
          if (viewport) {
            viewport.resetCamera();
            viewport.render();
          }
        }
      }
    } catch (error) {
      console.error("Error toggling full-screen:", error);
      toast.error("Failed to toggle full-screen.");
    }
  };

  const handleExportImage = () => {
    if (!renderingEngineRef.current) {
      toast.error("Rendering engine not initialized");
      return;
    }
    const viewport = renderingEngineRef.current.getViewport("myViewport");
    if (!viewport) {
      toast.error("Viewport not found");
      return;
    }
    const canvas = viewport.getCanvas();
    viewport.render();
    if (!canvas) {
      toast.error("Canvas not found");
      return;
    }
    try {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `dicom_image_${new Date().toISOString()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image exported successfully");
    } catch (error) {
      console.log("Error exporting image:", error);
      toast.error("Failed to export image");
    }
  };

  return (
    <header className="flex text-white border-muted  justify-between items-center px-6 py-2 top-0 left-0 right-0 z-10  border-b-blue-700 border-b   transition-all duration-300">
      <div className="flex items-center gap-2">
        <img src="vite.svg" alt="Logo" className="w-10 h-10" />
        <h1 className="text-lg font-semibold ">Cornerstone3d</h1>
      </div>
      <div className="flex items-center justify-center gap-2 ">
        <label
          htmlFor="series-upload"
          className="flex flex-col items-center gap-1 px-4 py-2 text-sidebar-foreground rounded hover:text-primary transition cursor-pointer"
        >
          {" "}
          <FolderUp className="w-6 h-6 text-white" aria-label="Upload" />
        </label>
        <input
          id="series-upload"
          type="file"
          accept=".dcm,image/dicom"
          multiple
          webkitdirectory="true"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center gap-1 px-4 py-2 text-sidebar-foreground rounded hover:text-primary transition cursor-pointer"
        >
          <FileUp className="w-6 h-6 text-white" aria-label="Upload" />
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".dcm,image/dicom"
          multiple
          // webkitdirectory="true"
          onChange={handleFileInput}
          disabled={uploading}
          className="hidden"
        />
        <button
          onClick={() =>
            activateTool(WindowLevelTool.toolName, toolGroupRef.current)
          }
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black ${
            activeTool === WindowLevelTool.toolName
              ? "bg-blue-700 text-black"
              : ""
          } `}
          title="Brightness/Contrast"
        >
          <Ban className="w-6 h-6" />
        </button>
        <button
          onClick={() =>
            activateTool(LengthTool.toolName, toolGroupRef.current)
          }
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black ${
            activeTool === LengthTool.toolName ? "bg-blue-700 text-black" : ""
          }`}
          title="Measure"
        >
          <Ruler className="w-6 h-6" />
        </button>
        <button
          onClick={() =>
            activateTool(CircleROITool.toolName, toolGroupRef.current)
          }
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black ${
            activeTool === LengthTool.toolName ? "bg-blue-700 text-black" : ""
          }`}
          title="Measure"
        >
          <Circle className="w-6 h-6" />
        </button>
        <button
          onClick={() => activateTool(AngleTool.toolName, toolGroupRef.current)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black ${
            activeTool === LengthTool.toolName ? "bg-blue-700 text-black" : ""
          }`}
          title="Measure"
        >
          <TriangleRight className="w-6 h-6" />
        </button>
        <button
          onClick={() => activateTool(ZoomTool.toolName, toolGroupRef.current)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black  ${
            activeTool === ZoomTool.toolName ? "bg-blue-700 text-black" : ""
          } `}
          title="Zoom"
        >
          <Search />
        </button>
        <button
          onClick={() => activateTool(PanTool.toolName, toolGroupRef.current)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black ${
            activeTool === PanTool.toolName ? "bg-blue-700 text-black" : ""
          } `}
          title="Pan"
        >
          <Move className="w-6 h-6" />
        </button>
        <button
          title="Reset view"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black `}
          onClick={resetViewport}
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button
          title="Capture"
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black `}
          onClick={handleExportImage}
        >
          <Camera className="w-6 h-6" />
        </button>
        <button
          title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer hover:bg-blue-700 hover:text-black"
          onClick={handleFullScreenToggle}
        >
          {isFullScreen ? (
            <Minimize2 className="w-6 h-6" />
          ) : (
            <Maximize2 className="w-6 h-6" />
          )}
        </button>
      </div>
      <div></div>
    </header>
  );
};

export default Header;
