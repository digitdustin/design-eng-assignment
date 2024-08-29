import { useState } from 'react';

export const useCustomRenames = (initialValue: CustomRename[] = []) => {
  const [customRenames, setCustomRenames] = useState<CustomRename[]>(initialValue);

  const updateCustomRename = (index: number, field: 'name' | 'newName', value: string) => {
    const updatedRenames = [...customRenames];
    updatedRenames[index][field] = value;
    if (field === 'name') {
      updatedRenames[index].newName = value;
    }
    setCustomRenames(updatedRenames);
  };

  const addCustomRename = () => {
    setCustomRenames([...customRenames, { name: '', newName: '' }]);
  };

  const removeCustomRename = (index: number) => {
    setCustomRenames(customRenames.filter((_, i) => i !== index));
  };

  return { customRenames, updateCustomRename, addCustomRename, removeCustomRename };
};
