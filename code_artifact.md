/* Base Layout & Custom Scrollbar */
body {
  font-family: 'Plus Jakarta Sans', 'Noto Sans', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  color: #0f172a;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 8px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
}

/* Print Stylesheet for PDF Worksheets */
@media print {
  body * {
    visibility: hidden;
  }
  #printableContent, #printableContent * {
    visibility: visible;
  }
  #printableContent {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    border: none !important;
    box-shadow: none !important;
  }
  #printSheetModal {
    position: absolute;
    left: 0;
    top: 0;
    background: white !important;
  }
}