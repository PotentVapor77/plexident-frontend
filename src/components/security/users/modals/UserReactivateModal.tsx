// components/users/UserReactivateModal.tsx

import React from 'react';
import type { IUser } from '../../../../types/user/IUser';

interface UserReactivateModalProps {
  user: IUser;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const UserReactivateModal: React.FC<UserReactivateModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="ml-4 text-lg font-semibold text-gray-900">
            Reactivar Usuario
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            ¿Estás seguro de que deseas reactivar al siguiente usuario?
          </p>
          <div className="bg-gray-50 rounded-md p-3 mt-3">
            <p className="text-sm">
              <span className="font-medium text-gray-700">Nombre:</span>{' '}
              <span className="text-gray-900">
                {user.nombres} {user.apellidos}
              </span>
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium text-gray-700">Username:</span>{' '}
              <span className="text-gray-900">{user.username}</span>
            </p>
            <p className="text-sm mt-1">
              <span className="font-medium text-gray-700">Rol:</span>{' '}
              <span className="text-gray-900">{user.rol}</span>
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            El usuario podrá iniciar sesión nuevamente en el sistema.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Reactivando...' : 'Reactivar Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};
