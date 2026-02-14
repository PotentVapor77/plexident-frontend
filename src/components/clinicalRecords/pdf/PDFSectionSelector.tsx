// src/components/clinicalRecord/pdf/PDFSectionSelector.tsx

import React, { useState, useEffect } from 'react';
import { Settings, X, Check } from 'lucide-react';
import Button from '../../ui/button/Button';
import { useClinicalRecordPDF } from '../../../hooks/clinicalRecord/useClinicalRecordPDF';



interface PDFSectionSelectorProps {
    historialId: string;
    pacienteNombre?: string;
    numeroHistoria?: string;
    onGenerate: (secciones: string[]) => void;
}

/**
 * Selector de secciones para PDF personalizado
 */
const PDFSectionSelector: React.FC<PDFSectionSelectorProps> = ({
    historialId,
    pacienteNombre,
    numeroHistoria,
    onGenerate,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(true);

    const { seccionesDisponibles, cargarSeccionesDisponibles } = useClinicalRecordPDF({
        showNotifications: false,
    });

    useEffect(() => {
        cargarSeccionesDisponibles();
    }, [cargarSeccionesDisponibles]);

    useEffect(() => {
        if (Object.keys(seccionesDisponibles).length > 0) {
            setSelectedSections(Object.keys(seccionesDisponibles));
        }
    }, [seccionesDisponibles]);

    const handleToggleAll = () => {
        if (selectAll) {
            setSelectedSections([]);
        } else {
            setSelectedSections(Object.keys(seccionesDisponibles));
        }
        setSelectAll(!selectAll);
    };

    const handleToggleSection = (key: string) => {
        setSelectedSections(prev => {
            const newSelection = prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key];

            setSelectAll(newSelection.length === Object.keys(seccionesDisponibles).length);
            return newSelection;
        });
    };

    const handleGenerate = () => {
        if (selectedSections.length > 0) {
            onGenerate(selectedSections);
            setIsOpen(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                title="Personalizar secciones del PDF"
            >
                <Settings className="h-4 w-4 mr-2" />
                Personalizar PDF
            </Button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Personalizar PDF
                    </h3>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={handleToggleAll}
                                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            Seleccionar todas
                        </label>
                    </div>

                    <div className="space-y-2">
                        {Object.entries(seccionesDisponibles).map(([key, nombre]) => (
                            <label
                                key={key}
                                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSections.includes(key)}
                                    onChange={() => handleToggleSection(key)}
                                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {nombre}
                                </span>
                            </label>
                        ))}
                    </div>

                    {selectedSections.length === 0 && (
                        <p className="text-sm text-error-600 mt-2">
                            Debe seleccionar al menos una sección
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={selectedSections.length === 0}
                    >
                        <Check className="h-4 w-4 mr-2" />
                        Generar PDF
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PDFSectionSelector;