export const validateName = (value) => {
  if (!value || value.length < 2 || value.length > 100) {
    return "El nombre es requerido y debe tener entre 2 y 100 caracteres";
  }
  return "";
};

export const validatePrice = (value) => {
  if (!value || isNaN(value) || parseFloat(value) <= 0) {
    return "El precio debe ser un número positivo";
  }
  return "";
};

export const validateDescription = (value) => {
  if (!value || value.length < 5 || value.length > 1000) {
    return "La descripción es requerida y debe tener entre 5 y 1000 caracteres";
  }
  return "";
};

export const validateImage = (value) => {
  if (!value) {
    return "La imagen es requerida";
  }
  return "";
};

export const validateBrand = (value) => {
  if (!value || value.length < 2 || value.length > 100) {
    return "La marca es requerida y debe tener entre 2 y 100 caracteres";
  }
  return "";
};

export const validateCategory = (value) => {
  if (!value || value.length < 2 || value.length > 100) {
    return "La categoría es requerida y debe tener entre 2 y 100 caracteres";
  }
  return "";
};

export const validateCountInStock = (value) => {
  if (!value || isNaN(value) || parseInt(value) < 0) {
    return "El stock debe ser un número entero no negativo";
  }
  return "";
};