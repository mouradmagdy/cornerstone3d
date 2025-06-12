import CornerstoneViewer from "./CornerstoneViewer";

function App() {
  // Example instance data (replace with actual DICOM metadata)
  const instance = {
    studyId: "1.2.3",
    seriesId: "4.5.6",
    cuadrId: "7.8.9",
    frames: 1,
    modality: "CT",
  };

  return (
    <div>
      <h1>Cornerstone3D React 18 Demo</h1>
      <CornerstoneViewer instance={instance} />
    </div>
  );
}

export default App;
