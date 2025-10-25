declare module 'jspdf' {
  export interface jsPDF {
    autoTable: (options: any) => void;
    lastAutoTable: {
      finalY: number;
    };
  }
}

declare module 'jspdf-autotable' {
  // Empty module declaration for autotable plugin
}