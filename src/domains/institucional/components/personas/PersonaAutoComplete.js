// src/domains/institucional/components/personas/PersonaAutoComplete.js
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AutoComplete } from 'primereact/autocomplete';
import debounce from 'lodash.debounce';
import { buscarPersonas } from '../../../../features/personas/personasSlice';

const etiquetaPersona = (p) =>
  p ? `${p.nombre} ${p.apellido}${p.documento ? ` (${p.documento})` : ''}` : '';

/**
 * Selector de Persona con búsqueda server-side, reutilizable en cualquier
 * formulario que necesite elegir una Persona sin depender de precargar
 * toda la tabla en el cliente.
 *
 * Props:
 *  - value: objeto Persona completo seleccionado, o null.
 *  - onChange(personaOrNull): recibe el objeto Persona completo
 *    para que el formulario pueda leer nombre/apellido si lo
 *    necesita, además de persona.id para el payload.
 *  - disabled
 *  - placeholder
 */
const PersonaAutoComplete = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Buscar por nombre, apellido o documento...',
}) => {
  const dispatch = useDispatch();
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const busquedaDebounced = useMemo(
    () =>
      debounce((texto) => {
        dispatch(buscarPersonas({ q: texto, pageSize: 15 }))
          .then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
              setSugerencias(result.payload.results ?? []);
            } else {
              setSugerencias([]);
            }
          })
          .finally(() => setBuscando(false));
      }, 350),
    [dispatch]
  );

  const buscar = useCallback(
    (e) => {
      const texto = e.query?.trim();
      if (!texto) {
        setSugerencias([]);
        return;
      }
      setBuscando(true);
      busquedaDebounced(texto);
    },
    [busquedaDebounced]
  );

  return (
    <AutoComplete
      value={value}
      suggestions={sugerencias}
      completeMethod={buscar}
      field={undefined}
      itemTemplate={(p) => etiquetaPersona(p)}
      selectedItemTemplate={etiquetaPersona}
      onChange={(e) => onChange(e.value && typeof e.value === 'object' ? e.value : null)}
      placeholder={placeholder}
      disabled={disabled}
      forceSelection
      dropdown={false}
      className="w-100"
      inputClassName="w-100"
      emptyMessage="No se encontraron personas."
    />
  );
};

export default PersonaAutoComplete;