import { useDicomContext } from "@/context/DicomContext";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Move,
  Ruler,
  Search,
  Upload,
} from "lucide-react";

import {
  WindowLevelTool,
  ZoomTool,
  LengthTool,
  PanTool,
  annotation,
} from "@cornerstonejs/tools";
import { useToolContext } from "@/context/ToolContext";

const Header = () => {
  const {
    setCurrentIndex,
    currentIndex,
    selectedSeries,
    uploading,
    handleFileInput,
  } = useDicomContext();
  const { activateTool, toolGroupRef } = useToolContext();

  return (
    <header className="flex text-white border-muted  justify-between items-center px-6 py-2 top-0 left-0 right-0 z-10  border-b-blue-700 border-b   transition-all duration-300">
      <div className="flex items-center gap-2">
        <img src="vite.svg" alt="Logo" className="w-10 h-10" />
        <h1 className="text-lg font-semibold ">Cornerstone</h1>
      </div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center gap-1 px-4 py-2 text-sidebar-foreground rounded hover:text-primary transition cursor-pointer"
        >
          {" "}
          <Upload className="w-6 h-6 text-white" aria-label="Upload" />
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".dcm,image/dicom"
          multiple
          onChange={handleFileInput}
          webkitdirectory="true"
          disabled={uploading}
          className="hidden"
        />
        <button
          onClick={() =>
            activateTool(WindowLevelTool.toolName, toolGroupRef.current)
          }
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer `}
          title="Brightness/Contrast"
        >
          <Ban className="w-6 h-6" />
        </button>
        <button
          onClick={() =>
            activateTool(LengthTool.toolName, toolGroupRef.current)
          }
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer `}
          title="Measure"
        >
          <Ruler className="w-6 h-6" />
        </button>
        <button
          onClick={() => activateTool(ZoomTool.toolName, toolGroupRef.current)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer `}
          title="Zoom"
        >
          <Search />
        </button>
        <button
          onClick={() => activateTool(PanTool.toolName, toolGroupRef.current)}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer `}
          title="Pan"
        >
          <Move className="w-6 h-6" />
        </button>
      </div>
      <div></div>
    </header>
  );
};

export default Header;
