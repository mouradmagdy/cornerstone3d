import Header from "@/components/Header";
import CornerstoneViewer from "@/components/CornerstoneViewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "../components/Sidebar";
import { ToolProvider } from "@/context/ToolContext";
import { useDicomContext } from "@/context/DicomContext";

const Home = () => {
  const { setCurrentIndex } = useDicomContext();
  return (
    <ToolProvider setCurrentIndex={setCurrentIndex}>
      <main>
        <div className="flex bg-black flex-col h-screen gap-1 text-foreground">
          <Header />
          <ResizablePanelGroup className="flex" direction="horizontal">
            <ResizablePanel minSize={2} defaultSize={20}>
              <Sidebar />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={80}>
              <CornerstoneViewer />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </ToolProvider>
  );
};

export default Home;
