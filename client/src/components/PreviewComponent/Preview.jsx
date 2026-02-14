const Preview = ({ pdfUrl, isLoading }) => {
  return (
    <div className="preview-container" style={{ height: '90vh', border: '1px solid #ccc' }}>
      {isLoading ? (
        <div className="loading-overlay">Compilation en cours...</div>
      ) : pdfUrl ? (
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          title="PDF Preview"
          style={{ border: 'none' }}
        />
      ) : (
        <div className="empty-preview">
          Clique sur "Compiler" pour voir le document
        </div>
      )}
    </div>
  );
};

export default Preview;