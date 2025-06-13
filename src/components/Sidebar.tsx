import { useDicomContext } from "@/context/DicomContext";

const Sidebar = () => {
  const { studies, handleSeriesSelect, selectedSeriesUID } = useDicomContext();
  return (
    <aside
      className={`overflow-y-auto w-full  text-sidebar-foreground border-muted left-0 top-16 h-[calc(100vh-4rem)]  border-r  flex flex-col items-center transition-all duration-300 `}
    >
      <h2>Studies</h2>
      {studies.length === 0 ? (
        <p>No Studies loaded</p>
      ) : (
        studies.map((study) => (
          <div key={study.studyUID} className="mb-4">
            <h3 className="text-md font-semibold">{study.studyDescription}</h3>

            <ul className="">
              {study.series.map((series) => (
                <li
                  key={series.seriesUID}
                  className={`cursor-pointer ${
                    selectedSeriesUID === series.seriesUID
                      ? "bg-blue-200 text-blue-800"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handleSeriesSelect(series)}
                >
                  {series.seriesDescription} (Images: {series.images.length})
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </aside>
  );
};

export default Sidebar;
