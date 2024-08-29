figma.showUI(__html__);

figma.ui.resize(380, 600);

let renameActions: RenameAction[] = [];
let lastNotification: NotificationHandler | null = null;

// send native figma notification
const notify = (message: string, options?: NotificationOptions) => {
  if (lastNotification) {
    // cancel last notification to immediately show new one
    lastNotification.cancel();
  }
  lastNotification = figma.notify(message, options);
};

// Get all unique instance types and their counts across the current page
function getAllUniqueInstances(node: SceneNode | PageNode): UniqueInstance[] {
  let instancesMap = new Map<string, number>();

  function traverse(n: SceneNode | PageNode) {
    if (n.type === 'INSTANCE' && n.mainComponent && n.mainComponent.parent) {
      const parentName = n.mainComponent.parent.name;
      instancesMap.set(parentName, (instancesMap.get(parentName) || 0) + 1);
    }

    if ('children' in n) {
      for (const child of n.children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return Array.from(instancesMap.entries()).map(([name, count]) => ({ name, count }));
}

// Select and highlight instances of a certain type
function selectAndHighlightInstances(componentType: string) {
  const instances = figma.currentPage.findAll((node) => {
    if (node.type === 'INSTANCE' && node.mainComponent && node.mainComponent.parent) {
      return node.mainComponent.parent.name === componentType;
    }
    return false;
  }) as InstanceNode[];

  if (instances.length > 0) {
    figma.currentPage.selection = instances;
    figma.viewport.scrollAndZoomIntoView(instances);
  }

  notify(`Selected ${instances.length} instance(s) of "${componentType}"`);
}

// Recursively traverse the current page and its children to rename layers
function traverseLayers(
  node: SceneNode | PageNode,
  componentMapping: Record<string, string>,
  customRenames: CustomRename[]
): { results: RenamedItem[]; actions: RenameAction[] } {
  let results: RenamedItem[] = [];
  let actions: RenameAction[] = [];

  if (node.type === 'INSTANCE') {
    const mainComponent = node.mainComponent;
    if (mainComponent && mainComponent.parent) {
      const parentName = mainComponent.parent.name;

      let newName = node.name;
      let renamed = false;

      // Check custom renames first
      const customRename = customRenames.find((cr) => cr.name === parentName);
      if (customRename) {
        newName = customRename.newName;
        renamed = true;
      } else if (componentMapping.hasOwnProperty(parentName)) {
        newName = componentMapping[parentName];
        renamed = true;
      }

      if (renamed) {
        results.push({
          id: node.id,
          originalName: node.name,
          newName: newName,
          type: parentName,
        });

        // add rename action to undo later
        actions.push({ node, oldName: node.name, newName });
        // rename the node
        node.name = newName;
      }
    }
  }

  if ('children' in node) {
    for (const child of node.children) {
      const childResults = traverseLayers(child, componentMapping, customRenames);
      results = results.concat(childResults.results);
      actions = actions.concat(childResults.actions);
    }
  }

  return { results, actions };
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'rename-components') {
    const { buttonName, serviceTilesName, listItemName, customRenames } = msg;

    // if a selection is made, use that, otherwise use the current page
    let nodesToProcess = figma.currentPage.selection.length > 0 ? figma.currentPage.selection : [figma.currentPage];

    const componentMapping = {
      Button: buttonName,
      'Elements / Service Tiles': serviceTilesName,
      'List item': listItemName,
    };

    let allResults: RenamedItem[] = [];
    renameActions = []; // Reset undo stack

    for (const node of nodesToProcess) {
      const { results, actions } = traverseLayers(node, componentMapping, customRenames);
      allResults = allResults.concat(results);
      renameActions = renameActions.concat(actions);
    }

    const renamedCount = {
      Button: 0,
      'Elements / Service Tiles': 0,
      'List item': 0,
      Custom: 0,
    };

    allResults.forEach((result) => {
      if (result.type in renamedCount) {
        renamedCount[result.type as keyof typeof renamedCount]++;
      } else {
        renamedCount.Custom++;
      }
    });

    const totalRenamed = allResults.length;

    notify(`${totalRenamed} layer${totalRenamed === 1 ? ' was' : 's were'} renamed`, {
      timeout: 3000,
      button: {
        text: 'Undo',
        action: () => {
          // Undo all rename actions
          renameActions.forEach((action) => {
            action.node.name = action.oldName;
          });

          notify(`Renamed ${totalRenamed} layer${totalRenamed === 1 ? '' : 's'} back to their original names`);

          // Clear the undo stack
          renameActions = [];
        },
      },
    });

    figma.ui.postMessage({
      type: 'rename-complete',
      message: '',
      previewItems: allResults,
    });
  } else if (msg.type === 'fetch-instances') {
    const uniqueInstances = getAllUniqueInstances(figma.currentPage);

    figma.ui.postMessage({
      type: 'instances-fetched',
      instances: uniqueInstances,
    });
  } else if (msg.type === 'highlight-instances') {
    selectAndHighlightInstances(msg.componentType);
  } else if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
