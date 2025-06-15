export interface Series {
  studyUID: string;
  seriesUID: string;
  seriesDescription: string;
  seriesNumber: number;
  images: { imageId: string; instanceNumber: number }[];
  thumbnail?: string | null;
}
export interface studies {
  studyUID: string;
  studyDescription: string;
  seriesMap: Map<string, Series>;
  series: Series[];
}

export interface dicomMetadata {
  [key: string]: {
    patientName: string;
    patientId: string;
    gender: string;
    modality: string;
    studyDate: number;
  };
}

export interface DicomContextType {
  studies: studies[];
  setStudies: (studies: studies[]) => void;
  selectedSeries: Series | null;
  handleSeriesSelect: (series: Series) => void;
  selectedSeriesUID: string | null;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  uploading: boolean;
  handleFileUpload: (files: FileList) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  dicomMetadata: { [key: string]: dicomMetadata };
  uploadProgress: number;
}
