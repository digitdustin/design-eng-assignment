// item that has been renamed
interface RenamedItem {
  id: string;
  originalName: string;
  newName: string;
  type: string;
}

// custom renames passed from the UI
interface CustomRename {
  name: string;
  newName: string;
}

// unique instance types and their counts fetched from canvas
interface UniqueInstance {
  name: string;
  count: number;
}

// rename action (stored to undo later if needed)
type RenameAction = {
  node: BaseNode;
  oldName: string;
  newName: string;
};
