import { createContext, useContext, useRef, useState } from "react";
import { RenderingEngine } from "@cornerstonejs/core";

import {
  WindowLevelTool,
  ZoomTool,
  StackScrollTool,
  LengthTool,
  PanTool,
  AngleTool,
  CircleROITool,
} from "@cornerstonejs/tools";
import { Enums as csToolsEnums } from "@cornerstonejs/tools";

interface ToolProviderProps {
  children: React.ReactNode;
  setCurrentIndex: (index: number) => void;
}

interface ToolContextType {
  toolGroupRef: React.MutableRefObject<any>;
  activateTool: (toolName: string, toolGroup?: any) => void;
  activeTool: string | null;
  renderingEngineRef: React.MutableRefObject<RenderingEngine>;
  resetViewport: () => void;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
}

const ToolContext = createContext<ToolContextType | undefined>(undefined);

export const ToolProvider: React.FC<ToolProviderProps> = ({
  children,
  setCurrentIndex,
}) => {
  const [activeTool, setActiveTool] = useState(WindowLevelTool.toolName);
  const toolGroupRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const viewportId = "myViewport";
  const viewportRef = useRef<HTMLDivElement>(null);

  const resetViewport = () => {
    if (renderingEngineRef.current) {
      const renderingEngine = renderingEngineRef.current;
      const viewport = renderingEngine.getViewport(viewportId);

      if (viewport) {
        viewport.resetCamera();
        setCurrentIndex(0);
        viewport.render();
      }
    }
  };

  const activateTool = (toolName, toolGroup) => {
    if (!toolGroup) return;
    [
      WindowLevelTool.toolName,
      LengthTool.toolName,
      PanTool.toolName,
      ZoomTool.toolName,
      CircleROITool.toolName,
      AngleTool.toolName,
    ].forEach((tool) => {
      if (tool !== StackScrollTool.toolName) {
        toolGroup.setToolPassive(tool);
      }
    });
    toolGroup.setToolActive(toolName, {
      bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
    });
    setActiveTool(toolName);
  };
  return (
    <ToolContext.Provider
      value={{
        toolGroupRef,
        activateTool,
        activeTool,
        renderingEngineRef,
        resetViewport,
        viewportRef,
      }}
    >
      {children}
    </ToolContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error("useToolContext must be used within a ToolProvider");
  }
  return context;
};
