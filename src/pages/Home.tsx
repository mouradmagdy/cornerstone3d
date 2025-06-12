import Header from "@/components/Header";
import CornerstoneViewer from "@/CornerstoneViewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Sidebar from "../components/Sidebar";

const Home = () => {
  return (
    <main>
      <div className="flex flex-col h-screen gap-1 bg-background text-foreground">
        <Header />
        <ResizablePanelGroup className="flex gap-1" direction="horizontal">
          <ResizablePanel minSize={2} defaultSize={20}>
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={80}>
            <CornerstoneViewer />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel minSize={2} defaultSize={2}>
            <div className="flex h-full w-full bg-secondary text-secondary-foreground">
              {/* Right Sidebar */}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
};

export default Home;
