// src/components/clinicalRecord/form/ClinicalRecordFormFields.tsx

import { Search, X, AlertCircle, Info, FileText, User, Heart, Activity, Stethoscope } from "lucide-react";
import type { IPaciente } from "../../../types/patient/IPatient";
import type { IUser } from "../../../types/user/IUser";
import type { ClinicalRecordFormData } from "../../../core/types/clinicalRecord.types";

/**
 * ============================================================================
 * CONSTANTES
 * ============================================================================
 */
const INSTITUCIONES_SISTEMA = {
    nombre: "FamySalud Centro medico",
    codigo: "MSP-EC-2026"
};

const ESTABLECIMIENTO_SALUD = {
    unicodigo: "12345-EC-SALUD",
    nombre: "Centro de Salud Dental Plexident"
};

/**
 * ============================================================================
 * STYLES
 * ============================================================================
 */
const STYLES = {
    input:
        "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 transition-all",
    label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
    select:
        "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10",
    textarea:
        "block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 resize-none",
    sectionCard:
        "bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4",
    sectionHeader:
        "flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700",
    sectionTitle:
        "text-lg font-semibold text-gray-900 dark:text-white",
    readOnlyField:
        "block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400",
    infoBox:
        "mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg",
};

/**
 * ============================================================================
 * PROPS
 * ============================================================================
 */
interface ClinicalRecordFormFieldsProps {
    mode: "create" | "edit";
    formData: ClinicalRecordFormData;
    onInputChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isCurrentUserOdontologo: boolean;
    // Paciente
    pacienteId: string | null;
    pacienteNombreCompleto: string | null;
    selectedPaciente: IPaciente | null;
    searchPaciente: string;
    showPacienteDropdown: boolean;
    pacientes: IPaciente[];
    loadingPacientes: boolean;
    onSearchPacienteChange: (value: string) => void;
    onSelectPaciente: (paciente: IPaciente) => void;
    onClearPaciente: () => void;
    setShowPacienteDropdown: (show: boolean) => void;

    // Odontólogo
    hideOdontologoSelector?: boolean;
    selectedOdontologo: IUser | null;
    searchOdontologo: string;
    showOdontologoDropdown: boolean;
    odontologos: IUser[];
    loadingOdontologos: boolean;
    onSearchOdontologoChange: (value: string) => void;
    onSelectOdontologo: (odontologo: IUser) => void;
    onClearOdontologo: () => void;
    setShowOdontologoDropdown: (show: boolean) => void;
}

/**
 * ============================================================================
 * HELPER FUNCTION
 * ============================================================================
 */
const getInitial = (value: string | null | undefined): string =>
    (value ?? "").toString().charAt(0).toUpperCase();

/**
 * ============================================================================
 * COMPONENT
 * ============================================================================
 */
export default function ClinicalRecordFormFields({
    mode,
    formData,
    onInputChange,
    onCheckboxChange,
    pacienteId,
    pacienteNombreCompleto,
    selectedPaciente,
    searchPaciente,
    showPacienteDropdown,
    pacientes,
    loadingPacientes,
    onSearchPacienteChange,
    onSelectPaciente,
    onClearPaciente,
    setShowPacienteDropdown,
    hideOdontologoSelector = false,
    selectedOdontologo,
    searchOdontologo,
    showOdontologoDropdown,
    odontologos,
    loadingOdontologos,
    onSearchOdontologoChange,
    onSelectOdontologo,
    onClearOdontologo,
    setShowOdontologoDropdown,
}: ClinicalRecordFormFieldsProps) {
    return (
        <div className="space-y-6">
            {/* ==================================================================
          ENCABEZADO DEL FORMULARIO 033
          ================================================================== */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8" />
                    <div>
                        <h2 className="text-2xl font-bold">Formulario 033</h2>
                        <p className="text-brand-100 text-sm">
                            Historia Clínica Única Odontológica
                        </p>
                    </div>
                </div>
                <p className="text-sm text-brand-50 mt-3">
                    {INSTITUCIONES_SISTEMA.nombre} • Código: {INSTITUCIONES_SISTEMA.codigo}
                </p>
            </div>

            {/* ==================================================================
          SECCIÓN A: DATOS DE ESTABLECIMIENTO Y USUARIO/PACIENTE
          ================================================================== */}
            <div className={STYLES.sectionCard}>
                <div className={STYLES.sectionHeader}>
                    <User className="h-5 w-5 text-brand-600" />
                    <h3 className={STYLES.sectionTitle}>
                        A. DATOS DE ESTABLECIMIENTO Y USUARIO / PACIENTE
                    </h3>
                </div>

                {/* Datos del establecimiento (hardcodeados) */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                UNICÓDIGO
                            </label>
                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {ESTABLECIMIENTO_SALUD.unicodigo}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                ESTABLECIMIENTO DE SALUD
                            </label>
                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {ESTABLECIMIENTO_SALUD.nombre}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Selector de Paciente (solo en modo create sin paciente fijado) */}
                {!pacienteId && mode === "create" && (
                    <div className="space-y-2">
                        <label className={STYLES.label}>
                            Seleccionar Paciente <span className="text-red-500">*</span>
                        </label>
                        {selectedPaciente ? (
                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                                        {getInitial(selectedPaciente?.nombres)}
                                        {getInitial(selectedPaciente?.apellidos)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {selectedPaciente.nombres} {selectedPaciente.apellidos}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            CI: {selectedPaciente.cedula_pasaporte} • Sexo: {selectedPaciente.sexo}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClearPaciente}
                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchPaciente}
                                    onChange={(e) => {
                                        onSearchPacienteChange(e.target.value);
                                        setShowPacienteDropdown(true);
                                    }}
                                    onFocus={() => setShowPacienteDropdown(true)}
                                    placeholder="Buscar paciente por nombre o cédula..."
                                    className={`${STYLES.input} pl-10`}
                                />

                                {/* Dropdown de pacientes */}
                                {showPacienteDropdown && searchPaciente && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {loadingPacientes ? (
                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                Buscando pacientes...
                                            </div>
                                        ) : pacientes && pacientes.length > 0 ? (
                                            pacientes.map((paciente: IPaciente) => (
                                                <button
                                                    key={paciente.id}
                                                    type="button"
                                                    onClick={() => onSelectPaciente(paciente)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                                                        {getInitial(paciente.nombres)}
                                                        {getInitial(paciente.apellidos)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {paciente.nombres} {paciente.apellidos}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            CI: {paciente.cedula_pasaporte}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                No se encontraron pacientes con "{searchPaciente}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!selectedPaciente && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Debe seleccionar un paciente para continuar.
                            </p>
                        )}
                    </div>
                )}

                {/* Paciente Fijado (mostrar datos según Form 033) */}
                {pacienteId && selectedPaciente && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Número de Historia Clínica */}
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                    N° HISTORIA CLÍNICA ÚNICA
                                </label>
                                <input
                                    type="text"
                                    value={selectedPaciente.id}
                                    className={STYLES.readOnlyField}
                                    readOnly
                                />
                            </div>

                            {/* Número de Archivo / No. Hoja (opcional) */}
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                    N° ARCHIVO / N° HOJA
                                </label>
                                <input
                                    type="text"
                                    value={`ARC-${selectedPaciente.cedula_pasaporte}`}
                                    className={STYLES.readOnlyField}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Datos del paciente */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                    PRIMER APELLIDO
                                </label>
                                <input
                                    type="text"
                                    value={selectedPaciente.apellidos?.split(" ")[0] || ""}
                                    className={STYLES.readOnlyField}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                    SEGUNDO APELLIDO
                                </label>
                                <input
                                    type="text"
                                    value={selectedPaciente.apellidos?.split(" ")[1] || ""}
                                    className={STYLES.readOnlyField}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                    PRIMER NOMBRE
                                </label>
                                <input
                                    type="text"
                                    value={selectedPaciente.nombres?.split(" ")[0] || ""}
                                    className={STYLES.readOnlyField}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                    SEGUNDO NOMBRE
                                </label>
                                <input
                                    type="text"
                                    value={selectedPaciente.nombres?.split(" ")[1] || ""}
                                    className={STYLES.readOnlyField}
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                                    SEXO
                                </label>
                                <input
                                    type="text"
                                    value={selectedPaciente.sexo === "M" ? "Masculino" : "Femenino"}
                                    className={STYLES.readOnlyField}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                )}

                {pacienteId && pacienteNombreCompleto && !selectedPaciente && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold">
                            {getInitial(pacienteNombreCompleto.split(" ")[0])}
                            {getInitial(pacienteNombreCompleto.split(" ")[1])}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Paciente activo
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {pacienteNombreCompleto}
                            </p>
                        </div>
                    </div>
                )}

                {/* Odontólogo Responsable */}
                {!hideOdontologoSelector && (
                    <div className="space-y-2">
                        <label className={STYLES.label}>
                            Odontólogo Responsable <span className="text-red-500">*</span>
                        </label>
                        {selectedOdontologo ? (
                            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-semibold">
                                        {getInitial(selectedOdontologo?.nombres)}
                                        {getInitial(selectedOdontologo?.apellidos)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            Dr(a). {selectedOdontologo.nombres}{" "}
                                            {selectedOdontologo.apellidos}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {selectedOdontologo.rol}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClearOdontologo}
                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchOdontologo}
                                    onChange={(e) => {
                                        onSearchOdontologoChange(e.target.value);
                                        setShowOdontologoDropdown(true);
                                    }}
                                    onFocus={() => setShowOdontologoDropdown(true)}
                                    placeholder="Buscar odontólogo por nombre..."
                                    className={`${STYLES.input} pl-10`}
                                />

                                {/* Dropdown de odontólogos */}
                                {showOdontologoDropdown && searchOdontologo && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {loadingOdontologos ? (
                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                Buscando odontólogos...
                                            </div>
                                        ) : odontologos && odontologos.length > 0 ? (
                                            odontologos.map((odontologo: IUser) => (
                                                <button
                                                    key={odontologo.id}
                                                    type="button"
                                                    onClick={() => onSelectOdontologo(odontologo)}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-semibold">
                                                        {getInitial(odontologo.nombres)}
                                                        {getInitial(odontologo.apellidos)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            Dr(a). {odontologo.nombres} {odontologo.apellidos}
                                                        </p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                                            {odontologo.rol}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                No se encontraron odontólogos con "{searchOdontologo}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {!selectedOdontologo && (
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Debe seleccionar un odontólogo responsable.
                            </p>
                        )}
                    </div>
                )}

                {/* Odontólogo asignado automáticamente */}
                {hideOdontologoSelector && selectedOdontologo && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-semibold">
                            {getInitial(selectedOdontologo?.nombres)}
                            {getInitial(selectedOdontologo?.apellidos)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Odontólogo responsable (asignado automáticamente)
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Dr(a). {selectedOdontologo.nombres} {selectedOdontologo.apellidos}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedOdontologo.rol}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* ==================================================================
          SECCIÓN B: MOTIVO DE CONSULTA
          ================================================================== */}
            <div className={STYLES.sectionCard}>
                <div className={STYLES.sectionHeader}>
                    <FileText className="h-5 w-5 text-brand-600" />
                    <h3 className={STYLES.sectionTitle}>B. MOTIVO DE CONSULTA</h3>
                </div>

                <div className="space-y-4">
                    {/* Motivo de consulta */}
                    <div>
                        <label htmlFor="motivo_consulta" className={STYLES.label}>
                            Motivo de consulta <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="motivo_consulta"
                            name="motivo_consulta"
                            rows={3}
                            value={formData.motivo_consulta}
                            onChange={onInputChange}
                            className={STYLES.textarea}
                            placeholder="Describa el motivo principal de la consulta..."
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Mínimo 10 caracteres · Máximo 500 caracteres
                        </p>
                    </div>

                    {/* Embarazo */}
                    <div>
                        <label htmlFor="embarazada" className={STYLES.label}>
                            ¿Embarazada?
                        </label>
                        <select
                            id="embarazada"
                            name="embarazada"
                            value={formData.embarazada}
                            onChange={onInputChange}
                            className={STYLES.select}
                        >
                            <option value="">Seleccione una opción</option>
                            <option value="SI">Sí</option>
                            <option value="NO">No</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* ==================================================================
          SECCIÓN C: ENFERMEDAD ACTUAL
          ================================================================== */}
            <div className={STYLES.sectionCard}>
                <div className={STYLES.sectionHeader}>
                    <Activity className="h-5 w-5 text-brand-600" />
                    <h3 className={STYLES.sectionTitle}>C. ENFERMEDAD ACTUAL</h3>
                </div>

                <div>
                    <label htmlFor="enfermedad_actual" className={STYLES.label}>
                        Descripción de la enfermedad o condición actual
                    </label>
                    <textarea
                        id="enfermedad_actual"
                        name="enfermedad_actual"
                        rows={4}
                        value={formData.enfermedad_actual}
                        onChange={onInputChange}
                        className={STYLES.textarea}
                        placeholder="Describa la enfermedad o condición actual del paciente..."
                        maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Máximo 1000 caracteres
                    </p>
                </div>
            </div>

            {/* ==================================================================
          SECCIÓN D: ANTECEDENTES PATOLÓGICOS PERSONALES
          ================================================================== */}
            <div className={STYLES.sectionCard}>
                <div className={STYLES.sectionHeader}>
                    <Heart className="h-5 w-5 text-brand-600" />
                    <h3 className={STYLES.sectionTitle}>
                        D. ANTECEDENTES PATOLÓGICOS PERSONALES
                    </h3>
                </div>

                <div className={STYLES.infoBox}>
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                            <p className="font-medium mb-1">
                                Sección en desarrollo
                            </p>
                            <p className="text-blue-800 dark:text-blue-200">
                                Los antecedentes patológicos personales se gestionarán desde el
                                perfil del paciente y se vincularán automáticamente a este
                                historial.
                            </p>
                            {mode === "create" && formData.usar_ultimos_datos && (
                                <p className="mt-2 text-blue-800 dark:text-blue-200">
                                    ✓ Se pre-cargarán los últimos antecedentes registrados
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================================================
          SECCIÓN E: ANTECEDENTES PATOLÓGICOS FAMILIARES
          ================================================================== */}
            <div className={STYLES.sectionCard}>
                <div className={STYLES.sectionHeader}>
                    <Heart className="h-5 w-5 text-brand-600" />
                    <h3 className={STYLES.sectionTitle}>
                        E. ANTECEDENTES PATOLÓGICOS FAMILIARES
                    </h3>
                </div>

                <div className={STYLES.infoBox}>
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                            <p className="font-medium mb-1">
                                Sección en desarrollo
                            </p>
                            <p className="text-blue-800 dark:text-blue-200">
                                Los antecedentes patológicos familiares se gestionarán desde el
                                perfil del paciente y se vincularán automáticamente a este
                                historial.
                            </p>
                            {mode === "create" && formData.usar_ultimos_datos && (
                                <p className="mt-2 text-blue-800 dark:text-blue-200">
                                    ✓ Se pre-cargarán los últimos antecedentes registrados
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================================================
          SECCIÓN F: CONSTANTES VITALES
          ================================================================== */}
            <div className={STYLES.sectionCard}>
                <div className={STYLES.sectionHeader}>
                    <Activity className="h-5 w-5 text-brand-600" />
                    <h3 className={STYLES.sectionTitle}>F. CONSTANTES VITALES</h3>
                </div>

                <div className={STYLES.infoBox}>
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                            <p className="font-medium mb-1">
                                Sección en desarrollo
                            </p>
                            <p className="text-blue-800 dark:text-blue-200">
                                Las constantes vitales (presión arterial, temperatura, pulso,
                                etc.) se registrarán en un formulario dedicado y se vincularán
                                a este historial.
                            </p>
                            {mode === "create" && formData.usar_ultimos_datos && (
                                <p className="mt-2 text-blue-800 dark:text-blue-200">
                                    ✓ Se pre-cargarán las últimas constantes vitales registradas
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================================================
          SECCIÓN G: EXAMEN DEL SISTEMA ESTOMATOGNÁTICO
          ================================================================== */}
            <div className={STYLES.sectionCard}>
                <div className={STYLES.sectionHeader}>
                    <Stethoscope className="h-5 w-5 text-brand-600" />
                    <h3 className={STYLES.sectionTitle}>
                        G. EXAMEN DEL SISTEMA ESTOMATOGNÁTICO
                    </h3>
                </div>

                <div className={STYLES.infoBox}>
                    <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                            <p className="font-medium mb-1">
                                Sección en desarrollo
                            </p>
                            <p className="text-blue-800 dark:text-blue-200">
                                El examen del sistema estomatognático se realizará mediante el
                                odontograma 3D interactivo y se vinculará automáticamente a
                                este historial.
                            </p>
                            {mode === "create" && formData.usar_ultimos_datos && (
                                <p className="mt-2 text-blue-800 dark:text-blue-200">
                                    ✓ Se pre-cargará el último examen estomatognático registrado
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================================================================
          OBSERVACIONES Y ESTADO
          ================================================================== */}
            <div className={STYLES.sectionCard}>
                <div className={STYLES.sectionHeader}>
                    <Info className="h-5 w-5 text-brand-600" />
                    <h3 className={STYLES.sectionTitle}>
                        Observaciones y Estado del Historial
                    </h3>
                </div>

                <div className="space-y-4">
                    {/* Observaciones */}
                    <div>
                        <label htmlFor="observaciones" className={STYLES.label}>
                            Observaciones del profesional
                        </label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            rows={3}
                            value={formData.observaciones}
                            onChange={onInputChange}
                            className={STYLES.textarea}
                            placeholder="Observaciones adicionales, notas clínicas relevantes..."
                            maxLength={2000}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Máximo 2000 caracteres
                        </p>
                    </div>

                    {/* Estado */}
                    <div>
                        <label htmlFor="estado" className={STYLES.label}>
                            Estado del historial
                        </label>
                        <select
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={onInputChange}
                            className={STYLES.select}
                        >
                            <option value="BORRADOR">Borrador</option>
                            <option value="ABIERTO">Abierto</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Los historiales cerrados no se pueden editar y deben reabrirse
                            mediante acción especial.
                        </p>
                    </div>
                </div>
            </div>

            {/* ==================================================================
          PRE-CARGA DE DATOS (solo create)
          ================================================================== */}
            {mode === "create" && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 p-4">
                    <div className="flex items-start gap-3">
                        <input
                            id="usar_ultimos_datos"
                            type="checkbox"
                            name="usar_ultimos_datos"
                            checked={formData.usar_ultimos_datos}
                            onChange={onCheckboxChange}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <div className="space-y-1">
                            <label
                                htmlFor="usar_ultimos_datos"
                                className="text-sm font-medium text-blue-900 dark:text-blue-100 cursor-pointer"
                            >
                                Usar últimos datos registrados del paciente
                            </label>
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                Se pre-cargarán automáticamente los últimos antecedentes,
                                constantes vitales y exámenes registrados para este paciente
                                (Secciones D, E, F y G).
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
