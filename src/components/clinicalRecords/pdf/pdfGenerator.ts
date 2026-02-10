// src/utils/pdfGenerator.ts

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Función para generar un PDF a partir de un elemento HTML
 * @param element Elemento HTML a capturar
 * @param fileName Nombre del archivo PDF
 */
export const generatePDFFromElement = async (element: HTMLElement, fileName: string): Promise<void> => {
    try {
        // Mostrar mensaje de carga
        const loadingMessage = document.createElement("div");
        loadingMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 30px;
      border-radius: 8px;
      z-index: 9999;
      font-weight: 500;
    `;
        loadingMessage.textContent = "Generando PDF...";
        document.body.appendChild(loadingMessage);

        // Crear una copia del contenido para no afectar la vista original
        const contentClone = element.cloneNode(true) as HTMLElement;

        // Aplicar estilos para compatibilidad con html2canvas
        prepareElementForCapture(contentClone);

        // Crear un contenedor temporal para la captura
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      width: ${element.offsetWidth}px;
      background: white;
      z-index: -9999;
    `;

        // Agregar estilos compatibles
        const styleElement = createCompatibleStyles();
        tempContainer.appendChild(styleElement);
        tempContainer.appendChild(contentClone);
        document.body.appendChild(tempContainer);

        // Capturar el contenido clonado
        const canvas = await html2canvas(contentClone, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc: Document) => {
                // Asegurar que todos los elementos tengan colores compatibles
                replaceOklchColors(clonedDoc);

                // Ocultar botones de descarga y elementos no deseados en el clon
                hideUnwantedElements(clonedDoc);
            }
        });

        // Limpiar el contenedor temporal
        document.body.removeChild(tempContainer);

        // Crear PDF
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        // Dimensiones de la página A4
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Dimensiones de la imagen
        const imgWidth = pageWidth - 20; // Margen de 10mm a cada lado
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Añadir imagen al PDF con paginación
        addImageToPDFWithPagination(pdf, imgData, imgWidth, imgHeight, pageHeight);

        // Guardar PDF
        pdf.save(fileName);

        // Remover mensaje de carga
        document.body.removeChild(loadingMessage);
    } catch (error) {
        console.error("Error al generar PDF:", error);

        // Limpiar mensajes de carga
        const loadingMessages = document.querySelectorAll("div[style*='position: fixed']");
        loadingMessages.forEach(msg => {
            if (msg.parentNode === document.body) {
                document.body.removeChild(msg);
            }
        });

        throw new Error("Error al generar el PDF. Por favor, intente nuevamente.");
    }
};

/**
 * Prepara el elemento para captura reemplazando estilos problemáticos
 */
const prepareElementForCapture = (element: HTMLElement): void => {
    // Agregar clase para estilos específicos de PDF
    element.classList.add('pdf-capture');

    // Establecer fondo blanco y modo claro forzado
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#000000';
    element.style.colorScheme = 'light';

    // Marcar botones de descarga para ocultarlos
    const downloadButtons = element.querySelectorAll('button');
    downloadButtons.forEach(button => {
        if (button.textContent?.includes('Descargar PDF') ||
            button.querySelector('.h-4.w-4')) {
            button.classList.add('pdf-ignore');
        }
    });

    // Reemplazar clases problemáticas de Tailwind
    const elementsWithClasses = element.querySelectorAll('[class]');
    elementsWithClasses.forEach((el) => {
        const classes = el.getAttribute('class') || '';
        // Limpiar clases problemáticas
        const fixedClasses = classes
            .split(' ')
            .filter(cls => !cls.includes('oklch') && !cls.match(/^bg-\[/) && !cls.match(/^text-\[/) && !cls.match(/^border-\[/))
            .join(' ');

        el.setAttribute('class', fixedClasses);
    });
};

/**
 * Crea estilos CSS compatibles para la captura
 */
const createCompatibleStyles = (): HTMLStyleElement => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    .pdf-capture * {
      color-scheme: light !important;
      color: #000000 !important;
      background-color: #ffffff !important;
      border-color: #d1d5db !important;
    }
    
    /* Estilos para clases específicas */
    .bg-brand-100 { background-color: #f0f9ff !important; }
    .text-brand-600 { color: #0284c7 !important; }
    
    .bg-green-100 { background-color: #dcfce7 !important; }
    .text-green-800 { color: #166534 !important; }
    .bg-yellow-100 { background-color: #fef9c3 !important; }
    .text-yellow-800 { color: #854d0e !important; }
    .bg-blue-100 { background-color: #dbeafe !important; }
    .text-blue-800 { color: #1e40af !important; }
    
    .dark\\:bg-gray-800 { background-color: #1f2937 !important; }
    .dark\\:border-gray-700 { border-color: #374151 !important; }
    .dark\\:text-white { color: #ffffff !important; }
    .dark\\:text-gray-400 { color: #9ca3af !important; }
    
    .border-gray-200 { border-color: #e5e7eb !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    .text-gray-900 { color: #111827 !important; }
    .text-gray-500 { color: #6b7280 !important; }
    .text-gray-400 { color: #9ca3af !important; }
    
    /* Ocultar elementos no deseados en PDF */
    .pdf-ignore { display: none !important; }
    
    /* Mejorar legibilidad */
    .pdf-capture {
      font-family: Arial, sans-serif !important;
      line-height: 1.5 !important;
    }
    
    .pdf-capture h1, 
    .pdf-capture h2, 
    .pdf-capture h3, 
    .pdf-capture h4 {
      font-weight: bold !important;
      margin-bottom: 0.5rem !important;
    }
    
    .pdf-capture .border-t {
      border-top: 1px solid #d1d5db !important;
    }
    
    .pdf-capture .border-b {
      border-bottom: 1px solid #d1d5db !important;
    }
  `;

    return styleElement;
};

/**
 * Reemplaza colores oklch por colores compatibles
 */
const replaceOklchColors = (clonedDoc: Document): void => {
    const allElements = clonedDoc.querySelectorAll('*');
    allElements.forEach(el => {
        const htmlEl = el as HTMLElement;
        const computedStyle = window.getComputedStyle(htmlEl);

        // Reemplazar colores oklch en background
        const bgColor = computedStyle.backgroundColor;
        if (bgColor.includes('oklch')) {
            htmlEl.style.backgroundColor = '#ffffff';
        }

        // Reemplazar colores oklch en color de texto
        const textColor = computedStyle.color;
        if (textColor.includes('oklch')) {
            htmlEl.style.color = '#000000';
        }

        // Reemplazar colores oklch en bordes
        const borderColor = computedStyle.borderColor;
        if (borderColor.includes('oklch')) {
            htmlEl.style.borderColor = '#d1d5db';
        }
    });
};

/**
 * Oculta elementos no deseados en el documento clonado
 */
const hideUnwantedElements = (clonedDoc: Document): void => {
    // Ocultar botones de descarga
    const buttons = clonedDoc.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.textContent?.includes('Descargar PDF') ||
            button.querySelector('.h-4.w-4')) {
            (button as HTMLElement).style.display = 'none';
        }
    });

    // Ocultar cualquier elemento con clase pdf-ignore
    const ignoreElements = clonedDoc.querySelectorAll('.pdf-ignore');
    ignoreElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
    });
};

/**
 * Añade imagen al PDF con paginación automática
 */
const addImageToPDFWithPagination = (
    pdf: jsPDF,
    imgData: string,
    imgWidth: number,
    imgHeight: number,
    pageHeight: number
): void => {
    let heightLeft = imgHeight;
    let position = 0;
    const margin = 10; // margen de 10mm

    // Primera página
    pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    heightLeft -= pageHeight - (2 * margin);

    // Páginas adicionales si el contenido es muy largo
    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
            imgData,
            "PNG",
            margin,
            position + margin,
            imgWidth,
            imgHeight
        );
        heightLeft -= pageHeight - (2 * margin);
    }
};

/**
 * Versión alternativa si necesitas usar ignoreElements (para versiones más antiguas)
 * Nota: Comenta esta función si no es necesaria
 */
export const generatePDFFromElementLegacy = async (element: HTMLElement, fileName: string): Promise<void> => {
    // Esta versión usa ignoreElements si está disponible
    const html2canvasOptions: any = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc: Document) => {
            replaceOklchColors(clonedDoc);
            hideUnwantedElements(clonedDoc);
        }
    };

    // Solo agregar ignoreElements si existe en la versión de html2canvas
    // Nota: Esta propiedad puede no estar disponible en todas las versiones
    if ('ignoreElements' in html2canvas) {
        html2canvasOptions.ignoreElements = (el: Element) => {
            return el.classList.contains('pdf-ignore') ||
                (el.tagName === 'BUTTON' && (
                    el.textContent?.includes('Descargar PDF') ||
                    el.querySelector('.h-4.w-4')
                ));
        };
    }

    // Resto del código similar...
};