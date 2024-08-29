import React, { useState, useEffect } from 'react';
import '../styles/ui.css';
import '../styles/fonts.css';
import Label from './ui/label';
import Input from './ui/input';
import Button from './ui/button';
import { Dropdown, DropdownOption } from './ui/dropdown';
import PlusIcon from '../assets/PlusIcon';
import XIcon from '../assets/XIcon';
import FocusIcon from '../assets/FocusIcon';
import { useCustomRenames } from '../hooks/useCustomRenames';
import { useInstances } from '../hooks/useInstances';
import { usePluginCommunication } from '../hooks/usePluginCommunication';

type RenameConfig = {
  buttonName: string;
  serviceTilesName: string;
  listItemName: string;
};

const RenameField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  onHighlight: () => void;
}> = ({ label, value, onChange, onHighlight }) => (
  <div className="flex flex-col w-full gap-y-1">
    <Label htmlFor={label}>{`Rename ${label} to:`}</Label>
    <div className="flex gap-x-2">
      <Input id={label} value={value} onChange={(e) => onChange(e.target.value)} />
      <Button onClick={onHighlight} variant="ghost" size="icon" className="!p-2" title={`Highlight ${label} instances`}>
        <FocusIcon />
      </Button>
    </div>
  </div>
);

function App() {
  const [renameConfig, setRenameConfig] = useState<RenameConfig>({
    buttonName: 'Button',
    serviceTilesName: 'Elements / Service Tiles',
    listItemName: 'List item',
  });

  const renameFields = [
    { key: 'buttonName', label: 'Buttons', instanceName: 'Button' },
    { key: 'serviceTilesName', label: 'Service Tiles', instanceName: 'Elements / Service Tiles' },
    { key: 'listItemName', label: 'List Items', instanceName: 'List item' },
  ];

  const { customRenames, updateCustomRename, addCustomRename, removeCustomRename } = useCustomRenames();
  const { instances, fetchInstances } = useInstances();
  const { sendPluginMessage } = usePluginCommunication();

  const onRename = () => {
    sendPluginMessage('rename-components', {
      ...renameConfig,
      customRenames: customRenames
        .map((rename) => ({
          name: rename.name,
          newName: rename.newName,
        }))
        .filter((rename) => rename.name && rename.newName),
    });
  };

  const onCancel = () => sendPluginMessage('cancel');

  const highlightInstances = (componentType: string) => {
    sendPluginMessage('highlight-instances', { componentType });
  };

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  return (
    <div>
      <header className="flex pt-16 p-4 bg-black w-full flex-col justify-between items-start">
        <h2 className="text-white font-uber text-xl">Layer Renamer</h2>
      </header>
      <main className="flex flex-col p-4 gap-y-3">
        {renameFields.map(({ key, label }) => (
          <RenameField
            key={key}
            label={label}
            value={renameConfig[key as keyof RenameConfig]}
            onChange={(value) => setRenameConfig((prev) => ({ ...prev, [key]: value }))}
            onHighlight={() => highlightInstances(renameFields.find((field) => field.key === key)?.instanceName || '')}
          />
        ))}

        <div className="flex flex-col w-full gap-y-3">
          {customRenames.map((rename, index) => (
            <div className="flex gap-x-2 items-end" key={index}>
              <div className="flex flex-col gap-y-1 w-1/2">
                <Label htmlFor={`custom-rename-${index}-id`}>Instance:</Label>
                <Dropdown
                  value={rename.name}
                  onChange={(value) => updateCustomRename(index, 'name', value)}
                  className=" p-2 border rounded"
                >
                  <DropdownOption value="" id={`custom-rename-${index}-name-select`}>
                    Select instance
                  </DropdownOption>
                  {instances.map((instance) => (
                    <DropdownOption key={instance.name} value={instance.name}>
                      {instance.name} ({instance.count})
                    </DropdownOption>
                  ))}
                </Dropdown>
              </div>
              <div className="flex flex-col gap-y-1 w-1/2">
                <Label htmlFor={`custom-rename-${index}-new-name`}>Rename to:</Label>
                <Input
                  id={`custom-rename-${index}-new-name`}
                  value={rename.newName}
                  onChange={(e) => updateCustomRename(index, 'newName', e.target.value)}
                  placeholder="New name"
                  className="w-1/2"
                />
              </div>
              {rename.name && (
                <Button
                  onClick={() => highlightInstances(rename.name)}
                  variant="ghost"
                  size="icon"
                  className="!p-2"
                  title="Highlight instances"
                >
                  <FocusIcon />
                </Button>
              )}
              <Button
                onClick={() => removeCustomRename(index)}
                variant="ghost"
                size="icon"
                className="!p-2"
                title="Remove custom instance"
              >
                <XIcon />
              </Button>
            </div>
          ))}
          <div className="h-9 w-full flex items-center justify-center">
            <div className="w-full h-px bg-neutral-200 relative">
              <Button
                onClick={addCustomRename}
                variant="ghost"
                size="icon"
                title="Add custom instance"
                className="absolute left-1/2 border !p-1.5 -translate-x-1/2 top-1/2 -translate-y-1/2 !bg-white shadow-md transition hover:shadow-lg !rounded-full"
              >
                <PlusIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full items-center justify-end gap-x-2 mt-2">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>

          <Button onClick={onRename} variant="primary">
            Rename Components
          </Button>
        </div>
      </main>
    </div>
  );
}

export default App;
