// Utility functions for managing hierarchical items (folders and grids)

const MAX_DEPTH = 4; // Allow up to 4 levels of nesting

/**
 * Calculate the depth of an item in the tree
 */
export const getItemDepth = (itemId, items, currentDepth = 0) => {
  if (currentDepth >= MAX_DEPTH) return MAX_DEPTH;

  for (const item of items) {
    if (item.id === itemId) return currentDepth;
    if (item.children?.length > 0) {
      const depth = getItemDepth(itemId, item.children, currentDepth + 1);
      if (depth !== -1) return depth;
    }
  }
  return -1;
};

/**
 * Check if adding a child would exceed max depth
 */
export const canAddChild = (parentId, items) => {
  const depth = getItemDepth(parentId, items);
  return depth < MAX_DEPTH - 1;
};

/**
 * Find an item by ID in the tree
 */
export const findItemById = (itemId, items) => {
  for (const item of items) {
    if (item.id === itemId) return item;
    if (item.children?.length > 0) {
      const found = findItemById(itemId, item.children);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Find parent of an item
 */
export const findParentItem = (itemId, items, parent = null) => {
  for (const item of items) {
    if (item.id === itemId) return parent;
    if (item.children?.length > 0) {
      const found = findParentItem(itemId, item.children, item);
      if (found !== null) return found;
    }
  }
  return null;
};

/**
 * Get all descendant IDs of an item (for deletion)
 */
export const getAllDescendantIds = (item) => {
  const ids = [item.id];
  if (item.children?.length > 0) {
    for (const child of item.children) {
      ids.push(...getAllDescendantIds(child));
    }
  }
  return ids;
};

/**
 * Flatten tree to array with parent references
 */
export const flattenItems = (items, parentId = null) => {
  const result = [];
  for (const item of items) {
    const flatItem = { ...item, parentId };
    delete flatItem.children;
    result.push(flatItem);

    if (item.children?.length > 0) {
      result.push(...flattenItems(item.children, item.id));
    }
  }
  return result;
};

/**
 * Build tree from flat array with parent references
 */
export const buildTree = (flatItems) => {
  const itemMap = {};
  const rootItems = [];

  // Create map of all items
  for (const item of flatItems) {
    itemMap[item.id] = { ...item, children: [] };
  }

  // Build tree structure
  for (const item of flatItems) {
    if (item.parentId && itemMap[item.parentId]) {
      itemMap[item.parentId].children.push(itemMap[item.id]);
    } else {
      rootItems.push(itemMap[item.id]);
    }
  }

  // Sort by order at each level
  const sortChildren = (items) => {
    items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    items.forEach(item => {
      if (item.children?.length > 0) {
        sortChildren(item.children);
      }
    });
  };

  sortChildren(rootItems);
  return rootItems;
};

/**
 * Migrate old folder/grid structure to new item structure
 */
export const migrateToItems = (folders, rootGrids) => {
  const items = [];

  // Migrate folders and their grids
  folders.forEach((folder, folderIndex) => {
    const folderItem = {
      id: folder.id,
      name: folder.name,
      type: 'folder',
      expanded: folder.expanded ?? true,
      order: folder.order ?? folderIndex,
      parentId: null,
      children: []
    };

    // Add folder's grids as children
    if (folder.grids?.length > 0) {
      folder.grids.forEach((grid, gridIndex) => {
        folderItem.children.push({
          id: grid.id,
          name: grid.name,
          type: 'grid',
          expanded: false,
          order: gridIndex,
          parentId: folder.id,
          cellStates: grid.cellStates || {},
          notes: grid.notes || '',
          children: []
        });
      });
    }

    items.push(folderItem);
  });

  // Migrate root grids
  rootGrids.forEach((grid, index) => {
    items.push({
      id: grid.id,
      name: grid.name,
      type: 'grid',
      expanded: false,
      order: grid.order ?? (folders.length + index),
      parentId: null,
      cellStates: grid.cellStates || {},
      notes: grid.notes || '',
      children: []
    });
  });

  // Sort by order
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return items;
};

/**
 * Update item in tree
 */
export const updateItemInTree = (items, itemId, updates) => {
  return items.map(item => {
    if (item.id === itemId) {
      return { ...item, ...updates };
    }
    if (item.children?.length > 0) {
      return {
        ...item,
        children: updateItemInTree(item.children, itemId, updates)
      };
    }
    return item;
  });
};

/**
 * Remove item from tree
 */
export const removeItemFromTree = (items, itemId) => {
  return items
    .filter(item => item.id !== itemId)
    .map(item => {
      if (item.children?.length > 0) {
        return {
          ...item,
          children: removeItemFromTree(item.children, itemId)
        };
      }
      return item;
    });
};

/**
 * Add item to tree
 */
export const addItemToTree = (items, newItem, parentId = null) => {
  if (!parentId) {
    // Add to root
    return [...items, newItem];
  }

  // Add to parent's children
  return items.map(item => {
    if (item.id === parentId) {
      return {
        ...item,
        children: [...(item.children || []), newItem],
        expanded: true // Auto-expand parent when adding child
      };
    }
    if (item.children?.length > 0) {
      return {
        ...item,
        children: addItemToTree(item.children, newItem, parentId)
      };
    }
    return item;
  });
};

/**
 * Move item to new parent
 */
export const moveItemInTree = (items, itemId, newParentId, newOrder) => {
  // First, find and remove the item
  let movedItem = null;
  const findAndRemove = (items) => {
    return items
      .filter(item => {
        if (item.id === itemId) {
          movedItem = item;
          return false;
        }
        return true;
      })
      .map(item => {
        if (item.children?.length > 0) {
          return {
            ...item,
            children: findAndRemove(item.children)
          };
        }
        return item;
      });
  };

  let result = findAndRemove(items);

  if (!movedItem) return items; // Item not found

  // Update item's order and parentId
  movedItem = { ...movedItem, order: newOrder, parentId: newParentId };

  // Add to new location
  result = addItemToTree(result, movedItem, newParentId);

  return result;
};
