import { useState, useEffect } from 'react';

/**
 * Hook personalizado para persistir estado en localStorage
 * @param {string} key - Clave para el localStorage
 * @param {any} initialValue - Valor inicial si no existe data
 * @returns {[any, Function]} - Estado y setter
 */
export function useLocalStorage(key, initialValue) {
  // Obtener del almacenamiento local o usar el valor inicial
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Retornar una versión envuelta de la función setter de useState que ...
  // ... persiste el nuevo valor en localStorage.
  const setValue = (value) => {
    try {
      // Permitir que value sea una función para tener la misma API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
