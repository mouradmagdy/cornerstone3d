import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface DicomContextType {
  studies: any[];
  setStudies: (studies: any[]) => void;
  selectedSeries: any;
  handleSeriesSelect: (series: any) => void;
  selectedSeriesUID: string | null;
}
const DicomContext = createContext<DicomContextType | undefined>(undefined);
interface DicomProviderProps {
  children: ReactNode;
}
export const DicomProvider: React.FC<DicomProviderProps> = ({ children }) => {
  const [studies, setStudies] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const handleSeriesSelect = (series) => {
    console.log("Selected series:", series);
    setSelectedSeries(series);
  };
  const selectedSeriesUID = selectedSeries?.seriesUID;
  return (
    <DicomContext.Provider
      value={{
        studies,
        setStudies,
        selectedSeries,
        handleSeriesSelect,
        selectedSeriesUID,
      }}
    >
      {children}
    </DicomContext.Provider>
  );
};

export const useDicomContext = () => {
  const context = useContext(DicomContext);
  if (!context) {
    throw new Error("useDicomContext must be used within a DicomProvider");
  }
  return context;
};
