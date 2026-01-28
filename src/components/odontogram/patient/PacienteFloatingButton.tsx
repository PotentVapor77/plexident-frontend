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
        className="fixed bottom-8 right-8 z-[100] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="Seleccionar Paciente"
      >
        <Users className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Seleccionar Paciente
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Búsqueda */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Lista de Pacientes */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredPacientes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No se encontraron pacientes</p>
                  <p className="text-sm mt-2">Intenta con otro término de búsqueda</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredPacientes.map((paciente: IPaciente) => (
                    <button
                      key={paciente.id}
                      onClick={() => handleSelect(paciente)}
                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                            {paciente.nombres} {paciente.apellidos}
                          </h3>
                          <div className="flex gap-4 mt-1 text-sm text-gray-600">
                            <span>CI: {paciente.cedula_pasaporte}</span>
                            {paciente.edad && <span>Edad: {paciente.edad} años</span>}
                            <span className="capitalize">{paciente.sexo}</span>
                          </div>
                        </div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <p className="text-sm text-gray-600 text-center">
                {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? 's' : ''} encontrado{filteredPacientes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
