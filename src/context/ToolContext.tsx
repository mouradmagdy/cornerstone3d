import { createContext, useContext, useRef, useState } from "react";
import {
  WindowLevelTool,
  ZoomTool,
  StackScrollTool,
  LengthTool,
  PanTool,
} from "@cornerstonejs/tools";
import { Enums as csToolsEnums } from "@cornerstonejs/tools";

const ToolContext = createContext();

export const ToolProvider = ({ children, setCurrentIndex }) => {
  const [activeTool, setActiveTool] = useState(WindowLevelTool.toolName);
  const toolGroupRef = useRef(null);
  const renderingEngineRef = useRef(null);
  const viewportId = "myViewport";

  const resetViewport = () => {
    if (renderingEngineRef.current) {
      const renderingEngine = renderingEngineRef.current;
      const viewport = renderingEngine.getViewport(viewportId);
      if (viewport) {
        console.log(viewport);
        const image = viewport.getCornerstoneImage();
        viewport.resetCamera();

        // if (image) {
        //   const windowWidth = image.windowWidth;
        //   const windowCenter = image.windowCenter;
        //   viewport.setVOI({ windowCenter, windowWidth });
        // }
        setCurrentIndex(0);

        // Re-render the viewport
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
      }}
    >
      {children}
    </ToolContext.Provider>
  );
};

export const useToolContext = () => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error("useToolContext must be used within a ToolProvider");
  }
  return context;
};
