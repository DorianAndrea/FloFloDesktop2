export const MAX_IMAGE_SIZE_MB = 2;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ALLOWED_IMAGE_EXTENSIONS_TEXT = "JPG, PNG o WEBP";

export const validateImageFile = (file) => {
  if (!file) {
    return {
      isValid: false,
      feedback: {
        type: "warning",
        icon: "⚠️",
        label: "Archivo no seleccionado",
        title: "No se seleccionó imagen",
        message: "Selecciona una imagen para continuar.",
      },
    };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      feedback: {
        type: "warning",
        icon: "⚠️",
        label: "Formato no permitido",
        title: "Imagen no válida",
        message: `Solo puedes subir imágenes ${ALLOWED_IMAGE_EXTENSIONS_TEXT}.`,
      },
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      isValid: false,
      feedback: {
        type: "warning",
        icon: "⚠️",
        label: "Imagen muy pesada",
        title: "El archivo supera el límite",
        message: `La imagen debe pesar máximo ${MAX_IMAGE_SIZE_MB} MB.`,
      },
    };
  }

  return {
    isValid: true,
    feedback: null,
  };
};