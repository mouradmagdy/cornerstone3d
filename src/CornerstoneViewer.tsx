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
  LengthTool,
  PanTool,
} from "@cornerstonejs/tools";
import { Progress } from "./components/ui/progress";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Move,
  Ruler,
  Search,
  Upload,
} from "lucide-react";
import { useDicomContext } from "./context/DicomContext";
const { ViewportType, Events } = Enums;

const CornerstoneViewer = () => {
  const [loading, setLoading] = useState(true);
  // const [studies, setStudies] = useState([]);
  // const [selectedSeries, setSelectedSeries] = useState(null);
  const { setStudies, selectedSeries, handleSeriesSelect } = useDicomContext();
  const [error, setError] = useState(null);
  // const [imageIds, setImageIds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTool, setActiveTool] = useState(WindowLevelTool.toolName);

  const renderingEngineId = "myRenderingEngine";
  const renderingEngineRef = useRef(null);
  const viewportRef = useRef(null);
  const initializedRef = useRef(false);
  const viewportId = "myViewport";
  const toolGroupId = "myToolGroup";
  const toolGroupRef = useRef(null);

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
      const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
      if (!toolGroup) {
        console.error("Failed to create tool group:", toolGroupId);
        return;
      }
      toolGroupRef.current = toolGroup;
      toolGroup.addTool(WindowLevelTool.toolName);
      toolGroup.addTool(ZoomTool.toolName);
      toolGroup.addTool(StackScrollTool.toolName);
      toolGroup.addTool(LengthTool.toolName);
      toolGroup.addTool(PanTool.toolName);

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

      console.log(viewportElement);
      viewportElement.addEventListener(Events.CAMERA_MODIFIED, () => {
        const viewport = renderingEngine.getViewport(viewportId);
        if (viewport) {
          const zoom = viewport.getZoom();
          setZoomLevel(Math.round(zoom * 100));
        }
      });

      setLoading(false);
    };

    initCornerstone();
  }, []);

  useEffect(() => {
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
      console.log(viewport);
      console.log(viewport.getZoom());
      viewport.setZoom(zoomLevel / 100);

      viewport.setStack(imageIds, currentIndex);
      viewport.render();
    }
  }, [selectedSeries, currentIndex, zoomLevel]);

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
  }, [currentIndex, selectedSeries]);

  const activateTool = (toolName) => {
    const toolGroup = toolGroupRef.current;
    if (!toolGroup) return;
    [WindowLevelTool.toolName, LengthTool.toolName, PanTool.toolName].forEach(
      (tool) => {
        if (tool != ZoomTool.toolName && tool !== StackScrollTool.toolName) {
          toolGroup.setToolPassive(tool);
        }
      }
    );
    if (toolName === LengthTool.toolName) {
      toolGroup.setToolActive(LengthTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
      });
    } else if (toolName === WindowLevelTool.toolName) {
      toolGroup.setToolActive(WindowLevelTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
      });
    } else if (toolName === PanTool.toolName) {
      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
      });
    } else if (toolName === ZoomTool.toolName) {
      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
      });
    }

    setActiveTool(toolName);
  };

  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    if (totalFiles === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const studyMap = new Map();

    const parsedFiles = [];
    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = fileArray[i];
        const arrayBuffer = await file.arrayBuffer();
        const byteArray = new Uint8Array(arrayBuffer);
        const dataset = dicomParser.parseDicom(byteArray);
        const transferSyntaxUID = dataset.string("x00020010");
        const studyUID = dataset.string("x0020000d"); // study
        console.log("Study UID:", studyUID);
        const seriesUID = dataset.string("x0020000e"); // series
        console.log("Series UID:", seriesUID);
        const instanceNumber = dataset.intString("x00200013") || 0; // InstanceNumber
        const seriesDescription =
          dataset.string("x0008103e") || `Series ${seriesUID.slice(-8)}`;
        const seriesNumber = dataset.intString("x00200011") || 0;
        if (!transferSyntaxUID) {
          console.warn(`No transfer syntax found for file: ${file.name}`);
          continue;
        }
        console.log(
          `Processing file: ${file.name}, Transfer Syntax UID: ${transferSyntaxUID}`
        );
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
            seriesUID,
            seriesDescription,
            seriesNumber,
            images: [],
          });
        }
        study.seriesMap.get(seriesUID).images.push({ imageId, instanceNumber });
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
        // parsedFiles.push({ imageId, instanceNumber });
      }
      const newStudies = Array.from(studyMap.values()).map((study) => ({
        ...study,
        series: Array.from(study.seriesMap.values()).map((series) => ({
          ...(series as object), // potentially error
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
    // parsedFiles.sort((a, b) => a.instanceNumber - b.instanceNumber);
    // const newImageIds = parsedFiles.map((item) => item.imageId);
    // setImageIds(newImageIds);
    // setUploading(false);
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
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDragEnter = (e) => {
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    setIsDragging(false);
  };

  // const handleSeriesSelect = (series) => {
  //   setSelectedSeries(series);
  //   setCurrentIndex(0);
  // };
  return (
    <div className="flex w-full h-full">
      {/* <TestBar
        studies={studies}
        onSeriesSelect={handleSeriesSelect}
        selectedSeriesUID={selectedSeries?.seriesUID}
      /> */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className="flex flex-col w-full h-full relative border-1 border-cyan-400 rounded-xl"
      >
        {/* {loading && <p>Loading Cornerstone...</p>} */}
        {uploading && (
          <div className="w-[60%]">
            <Progress value={uploadProgress} />
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mb-2">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center gap-1 px-4 py-2 text-sidebar-foreground rounded hover:text-primary transition cursor-pointer"
          >
            {" "}
            <Upload className="w-6 h-6" aria-label="Upload" />
            <span className="text-xs">Upload</span>
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
            onClick={() => activateTool(WindowLevelTool.toolName)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer `}
            title="Brightness/Contrast"
          >
            <Ban className="w-6 h-6" />
          </button>
          <button
            onClick={() => activateTool(LengthTool.toolName)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer `}
            title="Measure"
          >
            <Ruler className="w-6 h-6" />
          </button>
          <button
            onClick={() => activateTool(ZoomTool.toolName)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer `}
            title="Zoom"
          >
            <Search />
          </button>
          <button
            onClick={() => activateTool(PanTool.toolName)}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition cursor-pointer `}
            title="Pan"
          >
            <Move className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center mb-2">
          <button className="cursor-pointer">
            <ChevronLeft
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex((prev) => prev - 1);
                }
              }}
              className="w-6 h-6"
            />
          </button>
          <button className="cursor-pointer">
            <ChevronRight
              onClick={() => {
                if (
                  selectedSeries &&
                  currentIndex < selectedSeries.images.length - 1
                ) {
                  setCurrentIndex((prev) => prev + 1);
                }
              }}
              className="w-6 h-6"
            />
          </button>
        </div>
        {/* Zoom: {(zoomLevel / 100).toFixed(2)}x */}
        {selectedSeries && (
          <div className="">
            ({currentIndex + 1}/{selectedSeries?.images.length})
          </div>
        )}
        <div
          ref={viewportRef}
          //  style={{ width: "512px", height: "512px" }}
          className="w-full-h-full flex-1 !rounded-xl overflow-hidden"
        />
      </div>
    </div>
  );
};

export default CornerstoneViewer;
