export const validateName = (value) => {
  if (!value || value.length < 2 || value.length > 30) {
    return "El nombre es requerido y debe tener entre 2 y 30 caracteres";
  }
  return "";
};

export const validateEmail = (value) => {
  if (
    !value ||
    !/^\S+@\S+\.\S+$/.test(value) ||
    value.length < 2 ||
    value.length > 30
  ) {
    return "El email es requerido y debe tener entre 2 y 30 caracteres";
  }
  return "";
};

export const validatePassword = (value) => {
  if (!value || value.length < 5) {
    return "La contraseña debe tener al menos 5 caracteres";
  }
  return "";
};
