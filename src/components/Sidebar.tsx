import { useDicomContext } from "@/context/DicomContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Sidebar = () => {
  const { studies, handleSeriesSelect, selectedSeriesUID } = useDicomContext();
  return (
    <aside
      className={`overflow-y-auto w-full bg-black rounded-xl text-white border-muted left-0 top-16 h-[calc(100vh-4rem)] flex flex-col  transition-all duration-300 `}
    >
      <div className="w-full px-4 py-2 text-center border-b border-gray-700">
        <h2 className="text-lg font-medium text-blue-700 ">Studies</h2>
      </div>
      {studies.length === 0 ? (
        <p className="px-4 py-2">No Studies loaded</p>
      ) : (
        studies.map((study) => (
          <div key={study.studyUID} className="mb-2 px-4">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>{study.studyDescription}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {study.series.map((series) => (
                      <li
                        key={series.seriesUID}
                        className={`cursor-pointer flex items-center gap-2 px-2 py-1 rounded ${
                          selectedSeriesUID === series.seriesUID
                            ? "bg-blue-900 text-blue-600"
                            : "hover:bg-blue-900"
                        }`}
                        onClick={() => handleSeriesSelect(series)}
                      >
                        {series.thumbnail && (
                          <img
                            src={series.thumbnail}
                            alt={`${series.seriesDescription} thumbnail`}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = "";
                            }}
                          />
                        )}
                        <span>
                          {series.seriesDescription} (Images:{" "}
                          {series.images.length})
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))
      )}
    </aside>
  );
};

export default Sidebar;
