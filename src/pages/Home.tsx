import Header from "@/components/Header";
import CornerstoneViewer from "@/CornerstoneViewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "./Sidebar";

const Home = () => {
  return (
    <main>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <Header />
        <ResizablePanelGroup className="flex gap-2" direction="horizontal">
          <ResizablePanel>
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <CornerstoneViewer />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
};

export default Home;
