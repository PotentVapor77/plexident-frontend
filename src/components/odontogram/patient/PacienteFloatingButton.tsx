// src/components/odontogram/patient/PacienteFloatingButton.tsx
import React, { useState } from 'react';
import { Search, Users, X } from 'lucide-react';
import type { IPaciente } from '../../../types/patient/IPatient';
import { usePacientes } from '../../../hooks/patient/usePatients';

interface Props {
  onSelectPaciente: (paciente: IPaciente) => void;
}

export const PacienteFloatingButton: React.FC<Props> = ({ onSelectPaciente }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { pacientes, isLoading } = usePacientes({ page_size: 100 });

  const filteredPacientes = pacientes.filter((p: IPaciente) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${p.nombres} ${p.apellidos}`.toLowerCase();
    const cedula = p.cedula_pasaporte?.toLowerCase() || '';
    
    return fullName.includes(searchLower) || cedula.includes(searchLower);
  });

  const handleSelect = (paciente: IPaciente) => {
    onSelectPaciente(paciente);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[100] bg-brand-600 hover:bg-brand-700 text-white rounded-full p-4 shadow-lg shadow-brand-600/25 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        aria-label="Seleccionar Paciente"
      >
        <Users className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <section className="bg-white rounded-lg border border-gray-200 shadow-theme-sm w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-300 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 border border-brand-100">
                    <Users className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Seleccionar Paciente
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Elige un paciente para continuar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-gray-900 text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Pacientes */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-brand-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Cargando pacientes...
                  </p>
                </div>
              ) : filteredPacientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-200 mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    No se encontraron pacientes
                  </h4>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
                    {searchTerm ? "Intenta con otro término de búsqueda" : "No hay pacientes registrados en el sistema"}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPacientes.map((paciente: IPaciente) => (
                    <button
                      key={paciente.id}
                      onClick={() => handleSelect(paciente)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-brand-200 hover:bg-brand-50/50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-700 text-white font-semibold text-sm shadow-sm">
                              {paciente.nombres[0]}{paciente.apellidos[0]}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 group-hover:text-brand-700">
                                {paciente.nombres} {paciente.apellidos}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span>CI: {paciente.cedula_pasaporte}</span>
                                {paciente.edad && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span>{paciente.edad} años</span>
                                  </>
                                )}
                                {paciente.sexo && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="capitalize">{paciente.sexo.toLowerCase()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                  <p className="text-xs text-gray-500">
                    {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? 's' : ''} encontrado{filteredPacientes.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  Total en sistema: {pacientes.length}
                </span>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};