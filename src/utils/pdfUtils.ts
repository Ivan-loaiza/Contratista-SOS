/**
 * Utilidades para manejo de PDFs
 */

/**
 * Obtiene la URL base de la API desde las variables de entorno
 */
const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "https://localhost:7095";
};

/**
 * Construye la URL completa del PDF
 * @param pdfUrl - Ruta relativa o absoluta del PDF
 * @returns URL completa del PDF
 */
const buildFullPdfUrl = (pdfUrl: string): string => {
  // Si ya es una URL completa, retornarla tal cual
  if (pdfUrl.startsWith("http://") || pdfUrl.startsWith("https://")) {
    return pdfUrl;
  }

  // Construir URL completa con la base de la API
  const baseUrl = getApiBaseUrl();
  const cleanPath = pdfUrl.startsWith("/") ? pdfUrl : `/${pdfUrl}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Descarga un PDF desde una URL
 * @param url - URL del PDF (relativa o absoluta)
 * @param filename - Nombre del archivo a descargar (opcional)
 */
export const downloadPDF = async (url: string, filename?: string): Promise<void> => {
  try {
    const fullUrl = buildFullPdfUrl(url);
    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`Error al descargar el PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = filename || extractFilenameFromUrl(url) || "documento.pdf";
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error("Error descargando PDF:", error);
    throw error;
  }
};

/**
 * Abre un PDF en una nueva pestaña
 * @param url - URL del PDF (relativa o absoluta)
 */
export const openPDFInNewTab = (url: string): void => {
  const fullUrl = buildFullPdfUrl(url);
  window.open(fullUrl, "_blank", "noopener,noreferrer");
};

/**
 * Extrae el nombre del archivo de una URL
 * @param url - URL completa
 * @returns Nombre del archivo o null
 */
const extractFilenameFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
    return filename || null;
  } catch {
    return null;
  }
};

/**
 * Genera un nombre de archivo descriptivo para un documento
 * @param kind - Tipo de documento
 * @param contractorName - Nombre del contratista
 * @param date - Fecha del documento
 * @returns Nombre del archivo generado
 */
export const generateDocumentFilename = (
  kind: string,
  contractorName: string,
  date: string
): string => {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
  const sanitizedContractor = contractorName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const sanitizedKind = kind.toLowerCase();

  return `${sanitizedKind}_${sanitizedContractor}_${formattedDate}.pdf`;
};
