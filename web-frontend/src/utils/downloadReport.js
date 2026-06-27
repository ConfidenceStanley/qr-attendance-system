import axiosInstance from "../api/axiosInstance";

const downloadReport = async (url, filename, format = "pdf", extraParams = {}) => {
  try {
    const response = await axiosInstance.get(url, {
      params: { format, ...extraParams },
      responseType: "blob",
    });

    const mimeType = format === "csv" ? "text/csv" : "application/pdf";
    const blob = new Blob([response.data], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download report. Please try again.");
  }
};

export default downloadReport;