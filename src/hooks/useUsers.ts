// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import type { User } from '../services/userService';
import { getAllUsers, updateUser, deleteUser } from '../services/userService';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar los usuarios";
      setError(errorMessage);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id: string, userData: any) => {
    try {
      setError(null);
      const updatedUser = await updateUser(id, userData);
      await fetchUsers();
      return updatedUser;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(errorMessage);
      console.error('Error al actualizar usuario:', err);
      throw err;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      setError(null);
      await deleteUser(id);
      await fetchUsers();
      return true;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(errorMessage);
      console.error('Error al eliminar usuario:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    handleUpdateUser,
    handleDeleteUser
  };
}