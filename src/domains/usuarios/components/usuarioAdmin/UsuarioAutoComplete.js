// src/domains/usuarios/components/usuarioAdmin/UsuarioAutoComplete.js
import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AutoComplete } from 'primereact/autocomplete';
import debounce from 'lodash.debounce';
import { buscarUsuarios } from '../../../../features/usuarioAdmin/usuarioAdminSlice';

export const nombreUsuario = (u) => (u ? (u.persona_actual_nombre || u.username) : '');


const UsuarioAutoComplete = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Buscar por nombre o usuario...',
}) => {
  const dispatch = useDispatch();
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const busquedaDebounced = useMemo(
    () =>
      debounce((texto) => {
        dispatch(buscarUsuarios({ q: texto, pageSize: 15 }))
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
      itemTemplate={(u) => nombreUsuario(u)}
      selectedItemTemplate={nombreUsuario}
      onChange={(e) => onChange(e.value && typeof e.value === 'object' ? e.value : null)}
      placeholder={placeholder}
      disabled={disabled || buscando}
      forceSelection
      dropdown={false}
      className="w-100"
      inputClassName="w-100"
      emptyMessage="No se encontraron usuarios."
    />
  );
};

export default UsuarioAutoComplete;