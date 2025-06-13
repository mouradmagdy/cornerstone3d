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

export const ToolProvider = ({ children }) => {
  const [activeTool, setActiveTool] = useState(WindowLevelTool.toolName);
  const toolGroupRef = useRef(null);

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
    <ToolContext.Provider value={{ toolGroupRef, activateTool, activeTool }}>
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
