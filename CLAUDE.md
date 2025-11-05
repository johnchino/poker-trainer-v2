# GTO Poker Range Trainer - Architecture Documentation

## Project Overview

**Application Name:** GTO Poker Range Trainer (poker-trainer-v2)

**Purpose:** A web-based poker training application that allows users to create, manage, and visualize poker hand ranges using an interactive 13x13 grid system. Designed to help poker players study and memorize Game Theory Optimal (GTO) ranges for different positions and scenarios.

**Target Users:** Poker players (recreational to professional) who want to study optimal hand ranges and improve their pre-flop decision-making.

---

## Tech Stack

### Frontend
- **React 18.2.0** - UI framework with modern hooks
- **Vite 5.0.8** - Build tool and development server
- **JSX** - Component syntax

### Key Libraries
- **@dnd-kit/core** (v6.1.0) - Drag-and-drop functionality
- **@dnd-kit/sortable** (v8.0.0) - Sortable list capabilities
- **Firebase v10.7.1** - Backend-as-a-Service
  - Firebase Authentication (email/password)
  - Cloud Firestore (NoSQL database)

### Build System
- **Vite** with React plugin
- **ES Modules** (type: "module")
- Hot Module Replacement (HMR) for development

### Styling
- **Pure CSS** (no framework)
- CSS custom properties (variables)
- Dark theme design system

---

## Project Structure

```
C:/Users/bzk/Documents/poker-trainer-v2/
├── index.html                    # Entry HTML file
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── src/
│   ├── main.jsx                 # React app entry point
│   ├── App.jsx                  # Main application component (580 lines)
│   ├── firebase.js              # Firebase configuration
│   ├── styles.css               # Global styles (1030 lines)
│   └── components/
│       ├── PokerGrid.jsx        # 13x13 interactive poker hand grid
│       ├── Sidebar.jsx          # Navigation with folders/grids
│       ├── ColorPicker.jsx      # Custom HSV color picker
│       └── Icons.jsx            # SVG icon components
└── node_modules/                # Dependencies
```

---

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React App (App.jsx)                 │  │
│  │  ┌──────────────┐  ┌────────────────┐  ┌───────────┐ │  │
│  │  │   Sidebar    │  │   PokerGrid    │  │   Tools   │ │  │
│  │  │  (Folders/   │  │  (13x13 Grid)  │  │  (Colors/ │ │  │
│  │  │   Grids)     │  │                │  │   Stats)  │ │  │
│  │  └──────────────┘  └────────────────┘  └───────────┘ │  │
│  │         │                   │                  │       │  │
│  │         └───────────────────┴──────────────────┘       │  │
│  │                          │                             │  │
│  │                    State Manager                       │  │
│  │              (React Hooks + Context)                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Firebase SDK   │
                    ├─────────────────┤
                    │ Authentication  │
                    │   Firestore     │
                    └─────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Firebase Cloud  │
                    │   (Backend)     │
                    └─────────────────┘
```

### Architecture Pattern
- **Single Page Application (SPA)** with client-side routing
- **Component-Based Architecture** using React
- **State Management**: Centralized in App.jsx, passed down via props
- **Backend**: Firebase BaaS (no custom backend server)
- **Data Flow**: Unidirectional (top-down props, bottom-up events)

---

## Component Hierarchy

```
App.jsx (Root Component)
├── Authentication Screen (conditional)
│   ├── Login Form
│   └── Signup Form
│
├── Sidebar.jsx
│   ├── New Folder Button
│   ├── SortableContext (folders)
│   │   └── SortableFolder (per folder)
│   │       ├── Folder Header (name, expand/collapse)
│   │       ├── Action Buttons (rename, delete)
│   │       └── SortableContext (grids)
│   │           └── SortableGrid (per grid)
│   │               └── Grid Item (name, select, delete)
│   └── New Grid Button
│
├── Main Content Area
│   ├── Header
│   │   ├── Current Grid Name
│   │   ├── View Toggle (simple/full)
│   │   └── Logout Button
│   │
│   ├── PokerGrid.jsx
│   │   └── Grid Cells (13x13 = 169 cells)
│   │       └── Hand Cell (AA, AKs, AKo, etc.)
│   │
│   └── Tools Panel
│       ├── Paint Tools Section
│       │   ├── Mode Toggle (solid/mixed)
│       │   ├── Solid Colors List
│       │   │   └── Color Item (radio + name + actions)
│       │   ├── Mixed Colors List
│       │   │   └── Mixed Color Item (gradient preview)
│       │   └── Add Color Button
│       │
│       └── Range Statistics Section
│           ├── Progress Bar
│           ├── Percentage Display
│           └── Action Breakdown
│
└── ColorPicker.jsx (Modal, conditional)
    ├── HSV Canvas (saturation/value)
    ├── Hue Slider
    ├── Hex Input
    ├── Recent Colors
    └── Action Buttons (Save/Cancel)
```

### Component Responsibilities

**App.jsx** (`src/App.jsx`)
- State management for entire application
- Firebase authentication logic
- Data fetching and persistence
- Routing between auth and main app
- Props distribution to child components

**Sidebar.jsx** (`src/components/Sidebar.jsx`)
- Folder/grid navigation
- Drag-and-drop reordering
- Create/rename/delete operations
- Active grid highlighting

**PokerGrid.jsx** (`src/components/PokerGrid.jsx`)
- Render 13x13 poker hand grid
- Handle painting interactions (click, drag)
- Cell color management
- View mode toggling (simple/full)

**ColorPicker.jsx** (`src/components/ColorPicker.jsx`)
- HSV color selection interface
- Recent colors management (localStorage)
- Color value conversion (HSV to Hex)

**Icons.jsx** (`src/components/Icons.jsx`)
- Centralized SVG icon definitions
- Consistent icon styling

---

## State Management

### Primary State Location
All state is managed in `App.jsx` using React hooks. No external state management library (Redux, Zustand, etc.) is used.

### Key State Variables

```javascript
// User & Authentication
const [user, setUser] = useState(null);
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [isLogin, setIsLogin] = useState(true);
const [authError, setAuthError] = useState('');

// Folder & Grid Organization
const [folders, setFolders] = useState([]);
const [currentGrid, setCurrentGrid] = useState(null);

// Paint Tools
const [colors, setColors] = useState([
  { id: 'green', name: 'action 1', color: '#5DBA19', enabled: true },
  { id: 'yellow', name: 'action 2', color: '#FFD700', enabled: true },
  { id: 'red', name: 'action 3', color: '#DC143C', enabled: true },
  { id: 'blue', name: 'action 4', color: '#1E90FF', enabled: true }
]);
const [mixedColors, setMixedColors] = useState([]);
const [selectedColor, setSelectedColor] = useState('green');
const [selectedMixedColor, setSelectedMixedColor] = useState(null);
const [paintMode, setPaintMode] = useState('solid');

// UI State
const [simpleView, setSimpleView] = useState(false);
const [showColorPicker, setShowColorPicker] = useState(false);
const [editingColor, setEditingColor] = useState(null);
const [isEditingName, setIsEditingName] = useState(false);

// Loading State
const [loading, setLoading] = useState(true);
```

### Data Flow Pattern

```
User Action (e.g., paint cell)
    ↓
Event Handler in Component (e.g., handlePaintCell in PokerGrid)
    ↓
Callback Function (passed from App.jsx via props)
    ↓
State Update in App.jsx (setState)
    ↓
Firebase Update (updateDoc)
    ↓
React Re-render (with new state)
    ↓
UI Update
```

### Example: Painting a Cell

```javascript
// In PokerGrid.jsx
const handlePaintCell = (hand) => {
  const currentColor = cellStates[hand];

  if (paintMode === 'solid') {
    if (currentColor === selectedColor) {
      onCellPaint(hand, null); // Remove color
    } else {
      onCellPaint(hand, selectedColor); // Add color
    }
  } else if (paintMode === 'mixed') {
    // Similar logic for mixed colors
  }
};

// In App.jsx
const handleCellPaint = async (hand, color) => {
  const currentGridObj = folders
    .flatMap(f => f.grids)
    .find(g => g.id === currentGrid);

  const newCellStates = {
    ...currentGridObj.cellStates,
    [hand]: color
  };

  // Update Firestore
  await updateDoc(
    doc(db, 'users', user.uid, 'folders', folderId, 'grids', currentGrid),
    { cellStates: newCellStates }
  );

  // Update local state
  setFolders(updatedFolders);
};
```

---

## Data Models

### Firestore Database Structure

```
/users/{userId}/
  └── folders/{folderId}
      ├── name: string
      ├── order: number
      ├── expanded: boolean
      └── grids/{gridId}
          ├── name: string
          ├── order: number
          └── cellStates: {
              "AA": "green",
              "KK": "green",
              "AKs": "mixed1",
              ...
            }
```

### Folder Model

```javascript
{
  id: 'folder1234567890',      // Auto-generated ID
  name: 'My Ranges',            // User-defined name
  expanded: true,               // UI state (collapsed/expanded)
  grids: [...]                  // Array of grid objects (client-side only)
}
```

**Stored in Firestore:** `/users/{userId}/folders/{folderId}`

### Grid Model

```javascript
{
  id: 'grid1234567890',         // Auto-generated ID
  name: 'BB vs SB',             // User-defined name
  cellStates: {                 // Hand → Color mapping
    'AA': 'green',              // Painted with solid color
    'KK': 'green',
    'QQ': 'yellow',
    'AKs': 'mixed1',            // Painted with mixed color
    'AKo': null,                // Not painted (default)
    // ... up to 169 hands
  }
}
```

**Stored in Firestore:** `/users/{userId}/folders/{folderId}/grids/{gridId}`

### Color Models

**Solid Color:**
```javascript
{
  id: 'green',                  // Unique identifier
  name: 'action 1',             // Display name (editable)
  color: '#5DBA19',             // Hex color value
  enabled: true                 // Whether color is active
}
```

**Mixed Color:**
```javascript
{
  id: 'mixed1',                 // Unique identifier
  name: 'Mixed 1',              // Display name
  color1: 'green',              // First color ID
  color2: 'yellow'              // Second color ID
}
```

**Note:** Colors are stored in client-side state only, not in Firestore. They're user-specific and persist across sessions via component initialization.

### Hand Notation

Poker hands use standard notation:
- **Pairs:** `AA`, `KK`, `QQ`, `JJ`, `TT`, `99`, ..., `22`
- **Suited:** `AKs`, `AQs`, `AJs`, `KQs`, ... (s = suited)
- **Offsuit:** `AKo`, `AQo`, `AJo`, `KQo`, ... (o = offsuit)

Total: 169 unique starting hands

---

## Core Features

### 1. Authentication System

**Location:** `src/App.jsx` (lines 40-90)

**Flow:**
```javascript
// Firebase Auth initialization
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
    if (user) {
      loadFolders(user.uid);
    }
    setLoading(false);
  });
  return unsubscribe;
}, []);

// Login handler
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    setAuthError(error.message);
  }
};
```

**Features:**
- Email/password authentication
- Persistent sessions (browser refresh maintains login)
- Error handling with user feedback
- Automatic redirect on auth state change

### 2. Folder & Grid Management

**Location:** `src/components/Sidebar.jsx`

**Folder Operations:**
```javascript
// Create folder
const createFolder = async () => {
  const newFolder = {
    id: `folder${Date.now()}`,
    name: 'New Folder',
    expanded: true
  };

  await setDoc(
    doc(db, 'users', user.uid, 'folders', newFolder.id),
    newFolder
  );

  setFolders([...folders, { ...newFolder, grids: [] }]);
};

// Delete folder (with all grids)
const deleteFolder = async (folderId) => {
  const folder = folders.find(f => f.id === folderId);

  // Delete all grids in folder
  for (const grid of folder.grids) {
    await deleteDoc(
      doc(db, 'users', user.uid, 'folders', folderId, 'grids', grid.id)
    );
  }

  // Delete folder document
  await deleteDoc(doc(db, 'users', user.uid, 'folders', folderId));

  setFolders(folders.filter(f => f.id !== folderId));
};
```

**Drag-and-Drop:**
Uses `@dnd-kit` library with `SortableContext` and `useSortable` hooks:

```javascript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

const handleDragEnd = (event) => {
  const { active, over } = event;
  if (active.id !== over.id) {
    // Reorder logic
    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    updateOrder(newItems);
  }
};
```

### 3. Interactive Poker Grid

**Location:** `src/components/PokerGrid.jsx`

**Grid Generation:**
```javascript
const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const generateGrid = () => {
  return ranks.map((rank1, i) =>
    ranks.map((rank2, j) => {
      let hand;
      if (i === j) {
        hand = rank1 + rank2;              // Pairs: AA, KK, etc.
      } else if (i < j) {
        hand = rank1 + rank2 + 's';        // Suited: AKs, AQs, etc.
      } else {
        hand = rank2 + rank1 + 'o';        // Offsuit: AKo, AQo, etc.
      }
      return hand;
    })
  );
};
```

**Paint System:**
```javascript
const [isDrawing, setIsDrawing] = useState(false);

const handleMouseDown = (hand) => {
  setIsDrawing(true);
  paintCell(hand);
};

const handleMouseEnter = (hand) => {
  if (isDrawing) {
    paintCell(hand);
  }
};

const handleMouseUp = () => {
  setIsDrawing(false);
};

// Apply to grid container
<div
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
>
  {grid.map((row, i) =>
    row.map((hand, j) => (
      <div
        key={hand}
        onMouseDown={() => handleMouseDown(hand)}
        onMouseEnter={() => handleMouseEnter(hand)}
        style={{ backgroundColor: getCellColor(hand) }}
      >
        {formatHand(hand)}
      </div>
    ))
  )}
</div>
```

**View Modes:**
- **Simple View:** `AA`, `AK`, `AQ` (no s/o indicators)
- **Full View:** `AA`, `AKs`, `AKo`, `AQs`, `AQo` (with indicators)

### 4. Paint Tools System

**Location:** `src/App.jsx` (Paint Tools panel)

**Solid Colors:**
- Default: 4 colors (green, yellow, red, blue)
- Create unlimited custom colors
- Edit color value (hex) and name
- Enable/disable colors
- Delete colors (except last one)

**Mixed Colors:**
- Combine two solid colors
- Rendered as diagonal gradient
- Represents mixed strategies (e.g., 50% raise / 50% call)

**Color Picker:**
Custom HSV picker (`src/components/ColorPicker.jsx`):
```javascript
const ColorPicker = ({ initialColor, onSave, onClose }) => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);

  // Convert HSV to Hex
  const hsvToHex = (h, s, v) => {
    // Conversion logic...
    return hexColor;
  };

  // Recent colors stored in localStorage
  const saveRecentColor = (color) => {
    const recent = JSON.parse(localStorage.getItem('recentColors') || '[]');
    recent.unshift(color);
    localStorage.setItem('recentColors', JSON.stringify(recent.slice(0, 10)));
  };
};
```

### 5. Range Statistics

**Location:** `src/App.jsx` (Statistics panel)

**Calculation:**
```javascript
const calculateRangeStats = () => {
  const currentGridObj = folders
    .flatMap(f => f.grids)
    .find(g => g.id === currentGrid);

  if (!currentGridObj) return { total: 0, breakdown: {}, percentage: 0 };

  const cellStates = currentGridObj.cellStates || {};
  const breakdown = {};
  let total = 0;

  Object.values(cellStates).forEach(color => {
    if (color) {
      breakdown[color] = (breakdown[color] || 0) + 1;
      total++;
    }
  });

  const percentage = ((total / 169) * 100).toFixed(1);

  return { total, breakdown, percentage };
};
```

**Display:**
- Progress bar (visual percentage)
- Percentage text (e.g., "15.4%")
- Hand count (e.g., "26 / 169")
- Breakdown by action (e.g., "Raise: 15, Call: 8, Fold: 3")
- Pro tips based on range size

---

## Key Algorithms

### 1. Hand Generation Algorithm

**Location:** `src/components/PokerGrid.jsx`

Generates all 169 poker starting hands in a 13x13 matrix:

```javascript
const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const generateGrid = () => {
  return ranks.map((rank1, i) =>
    ranks.map((rank2, j) => {
      if (i === j) {
        // Diagonal: Pocket Pairs
        return rank1 + rank2;              // AA, KK, QQ, etc.
      } else if (i < j) {
        // Upper Triangle: Suited Hands
        return rank1 + rank2 + 's';        // AKs, AQs, AJs, etc.
      } else {
        // Lower Triangle: Offsuit Hands
        return rank2 + rank1 + 'o';        // AKo, AQo, AJo, etc.
      }
    })
  );
};
```

**Grid Layout:**
```
     A    K    Q    J    T    9    8    7    6    5    4    3    2
A   AA   AKs  AQs  AJs  ATs  A9s  A8s  A7s  A6s  A5s  A4s  A3s  A2s
K   AKo  KK   KQs  KJs  KTs  K9s  K8s  K7s  K6s  K5s  K4s  K3s  K2s
Q   AQo  KQo  QQ   QJs  QTs  Q9s  Q8s  Q7s  Q6s  Q5s  Q4s  Q3s  Q2s
J   AJo  KJo  QJo  JJ   JTs  J9s  J8s  J7s  J6s  J5s  J4s  J3s  J2s
...
```

### 2. Paint Toggle Logic

**Location:** `src/components/PokerGrid.jsx`

```javascript
const paintCell = (hand) => {
  const currentColor = cellStates[hand];
  let newColor;

  if (paintMode === 'solid') {
    // If cell already has the selected color, remove it
    // Otherwise, apply the selected color
    newColor = (currentColor === selectedColor) ? null : selectedColor;
  } else if (paintMode === 'mixed') {
    // If cell already has the selected mixed color, remove it
    // Otherwise, apply the selected mixed color
    newColor = (currentColor === selectedMixedColor) ? null : selectedMixedColor;
  }

  onCellPaint(hand, newColor);
};
```

**Behavior:**
- First click: Apply color
- Second click on same color: Remove color
- Click different color: Replace with new color

### 3. Range Percentage Calculation

**Location:** `src/App.jsx`

```javascript
const calculateRangePercentage = (cellStates) => {
  const paintedHands = Object.values(cellStates).filter(color => color !== null);
  return (paintedHands.length / 169) * 100;
};
```

**Example:**
- 26 painted hands → 15.4%
- 50 painted hands → 29.6%
- 169 painted hands → 100%

### 4. Drag-and-Drop Reordering

**Location:** `src/components/Sidebar.jsx`

```javascript
import { arrayMove } from '@dnd-kit/sortable';

const handleDragEnd = async (event) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  const oldIndex = folders.findIndex(f => f.id === active.id);
  const newIndex = folders.findIndex(f => f.id === over.id);

  const reordered = arrayMove(folders, oldIndex, newIndex);

  // Update Firestore with new order
  await Promise.all(
    reordered.map((folder, index) =>
      updateDoc(doc(db, 'users', user.uid, 'folders', folder.id), {
        order: index
      })
    )
  );

  setFolders(reordered);
};
```

---

## Firebase Integration

### Configuration

**Location:** `src/firebase.js`

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "poker-charts-76b65.firebaseapp.com",
  projectId: "poker-charts-76b65",
  storageBucket: "poker-charts-76b65.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Authentication Operations

```javascript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Login
await signInWithEmailAndPassword(auth, email, password);

// Signup
await createUserWithEmailAndPassword(auth, email, password);

// Logout
await signOut(auth);

// Listen to auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in
  } else {
    // User is logged out
  }
});
```

### Firestore Operations

**Create:**
```javascript
import { doc, setDoc } from 'firebase/firestore';

await setDoc(
  doc(db, 'users', userId, 'folders', folderId),
  { name: 'My Folder', expanded: true }
);
```

**Read:**
```javascript
import { collection, getDocs } from 'firebase/firestore';

const foldersSnapshot = await getDocs(
  collection(db, 'users', userId, 'folders')
);

const folders = foldersSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

**Update:**
```javascript
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(
  doc(db, 'users', userId, 'folders', folderId, 'grids', gridId),
  { cellStates: newCellStates }
);
```

**Delete:**
```javascript
import { doc, deleteDoc } from 'firebase/firestore';

await deleteDoc(
  doc(db, 'users', userId, 'folders', folderId)
);
```

### Data Loading Pattern

```javascript
const loadFolders = async (userId) => {
  // Load all folders
  const foldersSnapshot = await getDocs(
    collection(db, 'users', userId, 'folders')
  );

  const foldersData = await Promise.all(
    foldersSnapshot.docs.map(async (folderDoc) => {
      const folderData = { id: folderDoc.id, ...folderDoc.data() };

      // Load all grids for this folder
      const gridsSnapshot = await getDocs(
        collection(db, 'users', userId, 'folders', folderDoc.id, 'grids')
      );

      folderData.grids = gridsSnapshot.docs.map(gridDoc => ({
        id: gridDoc.id,
        ...gridDoc.data()
      }));

      return folderData;
    })
  );

  setFolders(foldersData);
};
```

### Default Data Creation

On first login, create a default folder and grid:

```javascript
const createDefaultFolder = async (userId) => {
  const folderId = `folder${Date.now()}`;
  const gridId = `grid${Date.now()}`;

  // Create folder
  await setDoc(doc(db, 'users', userId, 'folders', folderId), {
    name: 'My Ranges',
    expanded: true
  });

  // Create grid
  await setDoc(
    doc(db, 'users', userId, 'folders', folderId, 'grids', gridId),
    { name: 'BB vs SB', cellStates: {} }
  );

  return { folderId, gridId };
};
```

---

## UI/UX Patterns

### Design System

**Color Palette:**
```css
:root {
  --bg-primary: #0a0e1a;           /* Main background */
  --bg-secondary: #1a1d24;         /* Card background */
  --bg-tertiary: #252830;          /* Elevated elements */
  --border-color: #2a2d35;         /* Borders */
  --text-primary: #ffffff;         /* Primary text */
  --text-secondary: #a0a0a0;       /* Secondary text */
  --accent: #5DBA19;               /* Primary accent (green) */
}
```

**Typography:**
- Font: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", ...`)
- Base size: 14px
- Line height: 1.5
- Monospace for hand labels

**Spacing:**
- Base unit: 8px
- Padding: 12px, 16px, 20px
- Gap: 8px, 12px, 16px

### Layout Pattern

```css
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
```

### Interactive States

**Hover Effects:**
```css
.button:hover {
  opacity: 0.8;
  transform: translateY(-1px);
}

.grid-cell:hover {
  border-color: var(--accent);
}
```

**Active States:**
```css
.grid-item.active {
  background: linear-gradient(135deg, #2a2d35 0%, #1a1d24 100%);
  border-left: 3px solid var(--accent);
}
```

**Transitions:**
```css
.element {
  transition: all 0.2s ease;
}
```

### Component Patterns

**Card Component:**
```css
.card {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
```

**Input Fields:**
```css
.input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px 12px;
  color: var(--text-primary);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}
```

**Toggle Switch:**
```css
.toggle {
  width: 50px;
  height: 26px;
  background: var(--bg-tertiary);
  border-radius: 13px;
  position: relative;
  cursor: pointer;
}

.toggle.active {
  background: linear-gradient(135deg, #5DBA19, #4AA615);
}

.toggle-knob {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 3px;
  left: 3px;
  transition: transform 0.2s;
}

.toggle.active .toggle-knob {
  transform: translateX(24px);
}
```

---

## Development Guide

### Getting Started

**Prerequisites:**
- Node.js 16+ and npm
- Firebase account with project setup

**Installation:**
```bash
cd C:/Users/bzk/Documents/poker-trainer-v2
npm install
```

**Development:**
```bash
npm run dev
```
Starts Vite dev server on `http://localhost:5173`

**Build:**
```bash
npm run build
```
Outputs to `dist/` directory

**Preview Build:**
```bash
npm run preview
```

### Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Update `src/firebase.js` with your config

### Project Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Adding New Features

**Adding a New Color:**
```javascript
const addColor = () => {
  const newColor = {
    id: `color${Date.now()}`,
    name: 'New Color',
    color: '#FF5733',
    enabled: true
  };
  setColors([...colors, newColor]);
};
```

**Adding a New Grid:**
```javascript
const createGrid = async (folderId) => {
  const newGrid = {
    id: `grid${Date.now()}`,
    name: 'New Grid',
    cellStates: {}
  };

  await setDoc(
    doc(db, 'users', user.uid, 'folders', folderId, 'grids', newGrid.id),
    newGrid
  );

  // Update local state
  const updatedFolders = folders.map(f =>
    f.id === folderId
      ? { ...f, grids: [...f.grids, newGrid] }
      : f
  );
  setFolders(updatedFolders);
  setCurrentGrid(newGrid.id);
};
```

**Extending the Grid:**
To add metadata to hands (e.g., equity, playability):
```javascript
// In cellStates, store objects instead of strings
cellStates: {
  'AA': {
    color: 'green',
    equity: 85.3,
    note: 'Always raise'
  }
}
```

### Code Style Guidelines

- Use functional components with hooks
- Destructure props at function signature
- Use async/await for Firebase operations
- Handle errors with try/catch
- Keep components under 300 lines
- Extract reusable logic into helper functions
- Use meaningful variable names

---

## File Reference

### Key Files and Their Purposes

**`src/main.jsx`** (Entry Point)
- Renders React app into DOM
- Wraps App component with StrictMode

**`src/App.jsx`** (580 lines)
- Main application component
- State management hub
- Firebase operations
- Authentication flow
- Renders main UI structure

**`src/components/PokerGrid.jsx`**
- 13x13 hand grid rendering
- Paint interaction logic
- Cell color management
- View mode switching

**`src/components/Sidebar.jsx`**
- Folder/grid navigation
- Drag-and-drop functionality
- CRUD operations UI
- Active grid highlighting

**`src/components/ColorPicker.jsx`**
- HSV color picker interface
- Color conversion logic
- Recent colors management

**`src/components/Icons.jsx`**
- SVG icon definitions
- Centralized icon library

**`src/firebase.js`**
- Firebase initialization
- Auth and Firestore exports

**`src/styles.css`** (1030 lines)
- Global styles
- Component-specific styles
- Dark theme variables
- Responsive layout rules

**`vite.config.js`**
- Vite configuration
- React plugin setup

**`package.json`**
- Dependencies list
- Project scripts
- Metadata

---

## Best Practices

### Performance Optimization

1. **Minimize Firestore Writes:**
   - Debounce rapid updates (e.g., painting multiple cells)
   - Batch operations when possible

2. **Optimize Re-renders:**
   - Use `React.memo` for expensive components
   - Split large components into smaller ones
   - Move static data outside components

3. **Lazy Load Data:**
   - Load grids only when folder is expanded
   - Paginate if folder contains many grids

### Security Considerations

1. **Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

2. **Input Validation:**
   - Validate color hex values
   - Sanitize folder/grid names
   - Limit name lengths

3. **Authentication:**
   - Use Firebase Auth (secure by default)
   - Don't store sensitive data in Firestore
   - Implement email verification if needed

### Maintainability

1. **Component Organization:**
   - Keep components focused (single responsibility)
   - Extract complex logic into custom hooks
   - Use prop types or TypeScript for type safety

2. **State Management:**
   - Consider Context API for deeply nested props
   - Use reducer for complex state logic
   - Keep related state together

3. **Testing:**
   - Add unit tests for utility functions
   - Integration tests for Firebase operations
   - E2E tests for critical user flows

---

## Future Enhancement Ideas

1. **Import/Export Ranges:**
   - Export ranges as JSON, CSV, or images
   - Import ranges from popular poker tools

2. **Range Comparison:**
   - Side-by-side grid comparison
   - Diff visualization

3. **Equity Calculator:**
   - Integrate equity calculations
   - Show win rates for ranges

4. **Collaborative Features:**
   - Share ranges with other users
   - Public range library

5. **Mobile App:**
   - React Native version
   - Touch-optimized interactions

6. **Study Mode:**
   - Quiz functionality
   - Spaced repetition learning

7. **Position Presets:**
   - Pre-built ranges for common positions
   - GTO solver integrations

---

## Troubleshooting

### Common Issues

**Firebase Connection Errors:**
- Check internet connection
- Verify Firebase config in `src/firebase.js`
- Check Firebase project status

**Authentication Fails:**
- Verify email/password are correct
- Check Firebase Auth is enabled
- Clear browser cache/cookies

**Data Not Saving:**
- Check browser console for errors
- Verify Firestore rules allow writes
- Check user is authenticated

**Build Errors:**
- Delete `node_modules/` and reinstall
- Clear Vite cache: `rm -rf node_modules/.vite`
- Update dependencies

---

## Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [DND Kit Documentation](https://dndkit.com)

---

**Last Updated:** 2025-11-04
**Version:** 2.0
**Maintainer:** Project Team
