import { useState } from 'react';

/**
 * Custom hook for inline editing functionality
 * @param {string} initialValue - The initial value to edit
 * @param {Function} onSave - Callback when save is triggered
 * @returns {Object} - isEditing, editValue, setEditValue, startEdit, handleSave
 */
export const useInlineEdit = (initialValue, onSave) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialValue);

  const startEdit = () => {
    setEditValue(initialValue);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  return {
    isEditing,
    editValue,
    setEditValue,
    startEdit,
    handleSave,
    setIsEditing
  };
};
