// src/components/odontogram/patient/PacienteFloatingButton.tsx
import React, { useState } from 'react';
import { Search, Users, X } from 'lucide-react';
import type { IPaciente } from '../../../types/patient/IPatient';
import { usePacientes } from '../../../hooks/patient/usePatients';
import Button from '../../ui/button/Button';

interface Props {
  onSelectPaciente: (paciente: IPaciente) => void;
}

export const PacienteFloatingButton: React.FC<Props> = ({ onSelectPaciente }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { pacientes, isLoading: isLoading } = usePacientes({ page_size: 100 });

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
        className="fixed bottom-8 right-8 z-[100] bg-brand-500 hover:bg-brand-600 text-white rounded-full p-4 shadow-lg shadow-brand-500/30 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-label="Seleccionar Paciente"
      >
        <Users className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Seleccionar Paciente
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Elige un paciente para continuar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Búsqueda */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all dark:text-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Pacientes */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
                  <span className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Cargando pacientes...
                  </span>
                </div>
              ) : filteredPacientes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    No se encontraron pacientes
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPacientes.map((paciente: IPaciente) => (
                    <button
                      key={paciente.id}
                      onClick={() => handleSelect(paciente)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300">
                              {paciente.nombres[0]}{paciente.apellidos[0]}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                {paciente.nombres} {paciente.apellidos}
                              </h3>
                              <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>CI: {paciente.cedula_pasaporte}</span>
                                {paciente.edad && <span>Edad: {paciente.edad} años</span>}
                                <span className="capitalize">{paciente.sexo}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? 's' : ''} encontrado{filteredPacientes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};