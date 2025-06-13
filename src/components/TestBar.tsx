import React from "react";

const TestBar = ({ studies, onSeriesSelect, selectedSeriesUID }) => {
  return (
    <div className="w-64 h-full bg-gray-100 p-4 overflow-y-auto border-r border-gray-300">
      <h2 className="text-lg font-bold mb-4">Studies</h2>
      {studies.length === 0 ? (
        <p>No studies loaded</p>
      ) : (
        studies.map((study) => (
          <div key={study.studyUID} className="mb-4">
            <h3 className="text-md font-semibold">{study.studyDescription}</h3>
            <ul className="ml-4">
              {study.series.map((series) => (
                <li
                  key={series.seriesUID}
                  className={`cursor-pointer p-2 rounded ${
                    selectedSeriesUID === series.seriesUID
                      ? "bg-blue-200 text-blue-800"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => onSeriesSelect(series)}
                >
                  {series.seriesDescription} (Images: {series.images.length})
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default TestBar;
