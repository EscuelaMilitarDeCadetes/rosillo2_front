// src/domains/usuarios/components/usuarios/ReactivarVinculacionModal.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Message } from "primereact/message";
import {
  fetchHistorialPersona,
  reactivarPersonaDeGrupo,
  fetchGroupUsers,
} from "../../../../features/usuarios/personaGrupoSlice.js";

/*
  Modal para restituir la función "Activar Usuario" 
*/
const ReactivarVinculacionModal = ({ visible, onHide }) => {
  const dispatch = useDispatch();
  const { personas, loading: metadataLoading } = useSelector((state) => state.metadata);
  const { historialPersona, historialPersonaLoading, rowLoading, error } = useSelector(
    (state) => state.personaGrupo
  );
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    if (!visible) setSelectedPerson(null);
  }, [visible]);

  useEffect(() => {
    if (selectedPerson) dispatch(fetchHistorialPersona(selectedPerson));
  }, [selectedPerson, dispatch]);

  const handleReactivar = (id) => {
    dispatch(reactivarPersonaDeGrupo(id)).then((result) => {
      if (reactivarPersonaDeGrupo.fulfilled.match(result)) {
        dispatch(fetchHistorialPersona(selectedPerson));
        dispatch(fetchGroupUsers({ page: 1, pageSize: 10 }));
      }
    });
  };

  return (
    <Dialog header="Ver Historial / Reactivar Vinculación" visible={visible} style={{ width: "45vw" }} onHide={onHide}>
      <div className="p-fluid">
        <div className="field mb-3">
          <label htmlFor="persona">Persona</label>
          <Dropdown
            inputId="persona"
            value={selectedPerson}
            options={personas}
            onChange={(e) => setSelectedPerson(e.value)}
            optionLabel="correo"
            optionValue="id"
            filter
            placeholder="Seleccione una persona por su correo"
            loading={metadataLoading}
          />
        </div>

        {error && (
          <Message severity="error" className="mb-3 w-full" text={typeof error === "string" ? error : "Ocurrió un error."} />
        )}

        {historialPersonaLoading && <p>Cargando historial...</p>}

        {!historialPersonaLoading && selectedPerson && historialPersona.length === 0 && (
          <p className="text-color-secondary">Esta persona no tiene vinculaciones registradas.</p>
        )}

        {!historialPersonaLoading && historialPersona.length > 0 && (
          <ul className="list-group">
            {historialPersona.map((v) => (
              <li key={v.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{v.rol_grupo_nombre}</strong> — {v.grupo_nombre || v.facultad_nombre || "—"}
                  <br />
                  <small className="text-color-secondary">Vinculación: {v.vinculacion}</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Tag severity={v.estado ? "success" : "danger"} value={v.estado ? "Activa" : "Desvinculada"} />
                  {!v.estado && (
                    <Button
                      label="Reactivar"
                      icon="pi pi-refresh"
                      className="p-button-sm p-button-success"
                      loading={!!rowLoading[v.id]}
                      onClick={() => handleReactivar(v.id)}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
};

export default ReactivarVinculacionModal;