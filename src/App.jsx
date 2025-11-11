import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { Sidebar } from './components/Sidebar';
import { PokerGrid } from './components/PokerGrid';
import { ColorPicker } from './components/ColorPicker';
import { Icon } from './components/Icons';
import { useTrainingMode } from './hooks/useTrainingMode';
import { TrainingControls } from './components/TrainingControls';
import { TrainingResults } from './components/TrainingResults';

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [currentGrid, setCurrentGrid] = useState(null);
  const [selectedColor, setSelectedColor] = useState('green');
  const [colors, setColors] = useState([
    { id: 'green', name: 'action 1', color: '#5DBA19', enabled: true, textColor: 'white' },
    { id: 'red', name: 'action 2', color: '#B9107A', enabled: true, textColor: 'white' }
  ]);
  const [editingColorId, setEditingColorId] = useState(null);
  const [editingColorName, setEditingColorName] = useState('');
  const [simpleView, setSimpleView] = useState(true);
  const [mixedColors, setMixedColors] = useState([
    { id: 'mixed1', color1: '#5DBA19', color2: '#B9107A', name: 'mixed action', enabled: true }
  ]);
  const [paintMode, setPaintMode] = useState('solid');
  const [selectedMixedColor, setSelectedMixedColor] = useState('mixed1');
  const [colorPickerTarget, setColorPickerTarget] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Training mode hook
  const {
    trainingMode,
    trainingGridData,
    userAttempt,
    showResults,
    sessionStats,
    elapsedTime,
    startTraining,
    submitAttempt,
    resetAttempt,
    tryAgain,
    exitTraining,
    setUserAttempt
  } = useTrainingMode(user, currentGrid, folders);

  // Grid ref for exporting
  const gridRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) loadUserData(user.uid);
      else { setFolders([]); setCurrentGrid(null); }
    });
    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      const foldersSnapshot = await getDocs(collection(db, `users/${userId}/folders`));
      const loadedFolders = [];
      for (const folderDoc of foldersSnapshot.docs) {
        const folderData = folderDoc.data();
        const gridsSnapshot = await getDocs(collection(db, `users/${userId}/folders/${folderDoc.id}/grids`));
        const grids = gridsSnapshot.docs.map(gridDoc => ({ id: gridDoc.id, ...gridDoc.data() }));
        loadedFolders.push({ id: folderDoc.id, name: folderData.name, expanded: folderData.expanded || false, grids });
      }
      if (loadedFolders.length === 0) {
        const defaultFolder = await createDefaultFolder(userId);
        setFolders([defaultFolder]);
        setCurrentGrid(defaultFolder.grids[0].id);
      } else {
        setFolders(loadedFolders);
        setCurrentGrid(loadedFolders[0]?.grids[0]?.id || null);
      await loadColors(userId);
      }
    } catch (error) { 
      console.error('Error loading data:', error); 
    }
  };

  const createDefaultFolder = async (userId) => {
    const folderId = `folder${Date.now()}`;
    const gridId = `grid${Date.now()}`;
    const folder = { id: folderId, name: 'My Ranges', expanded: true, grids: [{ id: gridId, name: 'BB vs SB', cellStates: {} }] };
    await setDoc(doc(db, `users/${userId}/folders`, folderId), { name: folder.name, expanded: folder.expanded, createdAt: new Date() });
    await setDoc(doc(db, `users/${userId}/folders/${folderId}/grids`, gridId), { name: 'BB vs SB', cellStates: {}, createdAt: new Date() });
    return folder;
  };
  const saveColors = async (userId, solidColors, mixedColorsList) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, `users/${userId}/colors`, 'userColors'), {
        solidColors,
        mixedColors: mixedColorsList,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving colors:', error);
    }
  };

  const loadColors = async (userId) => {
    try {
      const colorsDoc = await getDoc(doc(db, `users/${userId}/colors`, 'userColors'));
      if (colorsDoc.exists()) {
        const data = colorsDoc.data();
        const validatedColors = (data.solidColors || []).map(c => ({ ...c, textColor: c.textColor || 'white' }));
        setColors(validatedColors);
        const validatedMixedColors = (data.mixedColors || []).map(mc => ({ ...mc, color1: mc.color1?.startsWith("#") ? mc.color1 : "#5DBA19", color2: mc.color2?.startsWith("#") ? mc.color2 : "#B9107A" }));
        setMixedColors(validatedMixedColors);
        if (data.solidColors && data.solidColors.length > 0) {
          setSelectedColor(data.solidColors[0].id);
        }
        if (data.mixedColors && data.mixedColors.length > 0) {
          setSelectedMixedColor(data.mixedColors[0].id);
        }
      } else {
        const defaultSolidColors = [
          { id: 'green', name: 'action 1', color: '#5DBA19', enabled: true, textColor: 'white' },
          { id: 'red', name: 'action 2', color: '#B9107A', enabled: true, textColor: 'white' }
        ];
        const defaultMixedColors = [
          { id: 'mixed1', color1: '#5DBA19', color2: '#B9107A', name: 'mixed action', enabled: true }
        ];
        setColors(defaultSolidColors);
        setMixedColors(defaultMixedColors);
        await saveColors(userId, defaultSolidColors, defaultMixedColors);
      }
    } catch (error) {
      console.error('Error loading colors:', error);
    }
  };


  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) { 
      setAuthError(error.message); 
    }
  };

  const handleLogout = async () => { 
    await signOut(auth); 
  };

  const getCurrentCellStates = () => {
    for (const folder of folders) {
      const grid = folder.grids.find(g => g.id === currentGrid);
      if (grid) return grid.cellStates || {};
    }
    return {};
  };

  const updateCurrentCellStates = async (newStates) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      grids: folder.grids.map(grid => grid.id === currentGrid ? { ...grid, cellStates: newStates } : grid)
    })));
    
    if (user) {
      for (const folder of folders) {
        const grid = folder.grids.find(g => g.id === currentGrid);
        if (grid) {
          await updateDoc(doc(db, `users/${user.uid}/folders/${folder.id}/grids`, currentGrid), {
            cellStates: newStates,
            updatedAt: new Date()
          });
          break;
        }
      }
    }
  };

  const addFolder = async () => {
    const folderId = `folder${Date.now()}`;
    const newFolder = { id: folderId, name: 'New Folder', expanded: true, grids: [] };
    setFolders(prev => [...prev, newFolder]);
    if (user) await setDoc(doc(db, `users/${user.uid}/folders`, folderId), { name: 'New Folder', expanded: true, createdAt: new Date() });
  };

  const addGrid = async (folderId = null) => {
    let targetFolderId = folderId;
    if (!targetFolderId) {
      if (folders.length === 0) {
        await addFolder();
        return;
      }
      targetFolderId = folders[0].id;
    }
    const gridId = `grid${Date.now()}`;
    const newGrid = { id: gridId, name: 'New Grid', cellStates: {} };
    setFolders(prev => prev.map(folder => folder.id === targetFolderId ? { ...folder, grids: [...folder.grids, newGrid] } : folder));
    if (user) await setDoc(doc(db, `users/${user.uid}/folders/${targetFolderId}/grids`, gridId), { name: 'New Grid', cellStates: {}, createdAt: new Date() });
    setCurrentGrid(gridId);
  };

  const deleteFolder = async (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder && user) {
      for (const grid of folder.grids) {
        await deleteDoc(doc(db, `users/${user.uid}/folders/${folderId}/grids`, grid.id));
      }
    }
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (user) await deleteDoc(doc(db, `users/${user.uid}/folders`, folderId));
    if (folder && folder.grids.some(g => g.id === currentGrid)) {
      const firstGrid = folders.flatMap(f => f.grids).find(g => !folder.grids.some(fg => fg.id === g.id));
      setCurrentGrid(firstGrid?.id || null);
    }
  };

  const deleteGrid = async (folderId, gridId) => {
    setFolders(prev => prev.map(folder => folder.id === folderId ? { ...folder, grids: folder.grids.filter(g => g.id !== gridId) } : folder));
    if (user) await deleteDoc(doc(db, `users/${user.uid}/folders/${folderId}/grids`, gridId));
    if (currentGrid === gridId) {
      const firstGrid = folders.flatMap(f => f.grids).find(g => g.id !== gridId);
      setCurrentGrid(firstGrid?.id || null);
    }
  };

  const renameFolder = async (folderId, newName) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
    if (user) await updateDoc(doc(db, `users/${user.uid}/folders`, folderId), { name: newName });
  };

  const renameGrid = async (folderId, gridId, newName) => {
    setFolders(prev => prev.map(folder => ({
      ...folder,
      grids: folder.grids.map(g => g.id === gridId ? { ...g, name: newName } : g)
    })));
    if (user) await updateDoc(doc(db, `users/${user.uid}/folders/${folderId}/grids`, gridId), { name: newName });
  };

  const toggleFolder = async (folderId) => {
    const updatedFolders = folders.map(folder => 
      folder.id === folderId ? { ...folder, expanded: !folder.expanded } : folder
    );
    setFolders(updatedFolders);
    if (user) {
      const folder = updatedFolders.find(f => f.id === folderId);
      await updateDoc(doc(db, `users/${user.uid}/folders`, folderId), { expanded: folder.expanded });
    }
  };

  const addColor = () => {
    const newColor = {
      id: `color${Date.now()}`,
      name: `action ${colors.length + 1}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`,
      enabled: true
    };
    const newColors = [...colors, newColor];
    setColors(newColors);
    setSelectedColor(newColor.id);
    if (user) saveColors(user.uid, newColors, mixedColors);
  };

  const deleteColor = (colorId) => {
    const newColors = colors.filter(c => c.id !== colorId);
    setColors(newColors);
    if (selectedColor === colorId && newColors.length > 0) {
      setSelectedColor(newColors[0].id);
    }
    if (user) saveColors(user.uid, newColors, mixedColors);
  };

  const startEditingColor = (colorId) => {
    const color = colors.find(c => c.id === colorId);
    setEditingColorId(colorId);
    setEditingColorName(color.name);
  };

  const saveColorName = () => {
    const newColors = colors.map(c => c.id === editingColorId ? { ...c, name: editingColorName } : c);
    setColors(newColors);
    setEditingColorId(null);
    setEditingColorName('');
    if (user) saveColors(user.uid, newColors, mixedColors);
  };

  const updateColorValue = (colorId, newColor) => {
    const newColors = colors.map(c => c.id === colorId ? { ...c, color: newColor } : c);
    setColors(newColors);
    if (user) saveColors(user.uid, newColors, mixedColors);
  };

  const toggleTextColor = async (colorId) => {
    const newColors = colors.map(c =>
      c.id === colorId
        ? { ...c, textColor: c.textColor === 'white' ? 'black' : 'white' }
        : c
    );
    setColors(newColors);
    if (user) await saveColors(user.uid, newColors, mixedColors);
  };

  const addMixedColor = () => {
    const newMixedColor = {
      id: `mixed${Date.now()}`,
      name: `mixed ${mixedColors.length + 1}`,
      color1: colors[0]?.color || '#5DBA19',
      color2: colors[1]?.color || '#B9107A',
      enabled: true
    };
    const newMixedColors = [...mixedColors, newMixedColor];
    setMixedColors(newMixedColors);
    setPaintMode('mixed');
    setSelectedMixedColor(newMixedColor.id);
    if (user) saveColors(user.uid, colors, newMixedColors);
  };

  const deleteMixedColor = (mixedColorId) => {
    const newMixedColors = mixedColors.filter(m => m.id !== mixedColorId);
    setMixedColors(newMixedColors);
    if (selectedMixedColor === mixedColorId && newMixedColors.length > 0) {
      setSelectedMixedColor(newMixedColors[0].id);
    } else if (newMixedColors.length === 0) {
      setPaintMode('solid');
      setSelectedColor(colors[0]?.id || 'green');
    }
    if (user) saveColors(user.uid, colors, newMixedColors);
  };

  const calculatePercentage = () => {
    const cellStates = getCurrentCellStates();
    let playHands = 0;
    Object.values(cellStates).forEach(state => { 
      if (state !== 'default') playHands++;
    });
    return ((playHands / 169) * 100).toFixed(1);
  };

  const clearAll = () => {
    updateCurrentCellStates({});
  };

  const handleExportGrid = async () => {
    if (!gridRef.current) return;

    try {
      // Show branding for export
      setIsExporting(true);
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: '#1a1d24',
        scale: 2, // Higher quality (2x resolution)
        logging: false,
        useCORS: true
      });

      // Hide branding after capture
      setIsExporting(false);

      // Convert to JPEG blob
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${currentGridData?.name || 'poker-grid'}.jpg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, 'image/jpeg', 0.95); // 95% quality JPEG
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false); // Make sure to reset on error
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-screen">
        <div className="auth-container">
          <h1 className="auth-title">GTO Range Trainer</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Login to access your ranges' : 'Create an account to get started'}
          </p>
          <div className="auth-card">
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="form-input" 
                  required 
                  minLength={6} 
                />
              </div>
              {authError && <div className="auth-error">{authError}</div>}
              <button type="submit" className="auth-button">
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setAuthError(''); }} 
                className="auth-toggle"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const currentGridData = folders.flatMap(f => f.grids).find(g => g.id === currentGrid);

  return (
    <div className="app">
      <Sidebar
        user={user}
        folders={folders}
        currentGrid={currentGrid}
        onFoldersChange={setFolders}
        onCurrentGridChange={setCurrentGrid}
        onAddFolder={addFolder}
        onAddGrid={addGrid}
        onDeleteFolder={deleteFolder}
        onDeleteGrid={deleteGrid}
        onRenameFolder={renameFolder}
        onRenameGrid={renameGrid}
        onToggleFolder={toggleFolder}
        onLogout={handleLogout}
      />
      
      <div className="main-content">
        {currentGrid ? (
          <div className="content-wrapper">
            <div className="grid-section">
              <div className="grid-header">
                <h1 className="grid-title">{currentGridData?.name || 'Grid'}</h1>
                <button
                  onClick={trainingMode ? exitTraining : startTraining}
                  className={`training-toggle-btn ${trainingMode ? 'active' : ''}`}
                  title={trainingMode ? 'Exit Training Mode' : 'Start Training Mode'}
                >
                  <Icon icon="brain" size={16} />
                  <span>{trainingMode ? 'Exit Training' : 'Practice'}</span>
                </button>
              </div>
              <div ref={gridRef} className="export-wrapper">
                {isExporting && <h1 className="export-title">{currentGridData?.name || 'Grid'}</h1>}
                <PokerGrid
                cellStates={trainingMode ? userAttempt : getCurrentCellStates()}
                onCellStatesChange={trainingMode ? setUserAttempt : updateCurrentCellStates}
                colors={colors}
                mixedColors={mixedColors}
                paintMode={paintMode}
                selectedColor={selectedColor}
                selectedMixedColor={selectedMixedColor}
                simpleView={simpleView}
                comparisonMode={trainingMode && showResults}
                correctAnswers={trainingGridData?.cellStates || {}}
              />
                {isExporting && (
                  <div className="export-branding">
                    Powered by: EASY<strong>POKER</strong>CHARTS.com
                  </div>
                )}
              </div>
              <div className="grid-controls">
                <button onClick={handleExportGrid} className="export-btn" title="Export as JPEG">
                  <Icon icon="save" size={16} />
                  <span>Export</span>
                </button>
                <div className="view-toggle">
                  <span className={`toggle-label ${simpleView ? 'active' : ''}`}>Simple</span>
                  <div
                    onClick={() => setSimpleView(!simpleView)}
                    className="neumorphic-toggle neumorphic-toggle-dark"
                  >
                    <div className={`neumorphic-switch neumorphic-switch-dark ${simpleView ? 'off-red-dark' : ''}`}></div>
                  </div>
                  <span className={`toggle-label ${!simpleView ? 'active' : ''}`}>Full</span>
                </div>
              </div>
            </div>

            <div className="tools-section">
              {trainingMode && showResults ? (
                // Training mode - Results view
                <TrainingResults
                  sessionStats={sessionStats}
                  onTryAgain={tryAgain}
                  onExit={exitTraining}
                />
              ) : (
                // Normal mode OR Training mode (before submission)
                <>
              <div className="panel">
                <h2 className="panel-title">Paint Tools</h2>
                <div className="colors-list">
                  {colors.map((color) => (
                    <div key={color.id} className="color-item group">
                      <button
                        onClick={() => {
                          setPaintMode('solid');
                          setSelectedColor(color.id);
                        }}
                        className={`color-radio ${paintMode === 'solid' && selectedColor === color.id ? 'selected' : ''}`}
                      >
                        {paintMode === 'solid' && selectedColor === color.id && <div className="radio-dot"></div>}
                      </button>
                      <button
                        onClick={() => {
                          setPaintMode('solid');
                          setSelectedColor(color.id);
                        }}
                        className={`color-swatch ${paintMode === 'solid' && selectedColor === color.id ? 'selected' : ''}`}
                        style={{ backgroundColor: color.color }}
                      ></button>
                      {editingColorId === color.id ? (
                        <input
                          type="text"
                          value={editingColorName}
                          onChange={(e) => setEditingColorName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveColorName()}
                          onBlur={saveColorName}
                          className="color-name-input"
                          autoFocus
                        />
                      ) : (
                        <button onClick={() => startEditingColor(color.id)} className="color-name-btn">
                          {color.name}
                        </button>
                      )}
                      <button
                        onClick={() => setColorPickerTarget({ type: 'solid', id: color.id })}
                        className="icon-btn-hidden"
                        title="Change Color"
                      >
                        <img
                          src="https://i.postimg.cc/L4C9zddV/dropper-2418414-1.png"
                          alt="dropper"
                          className="dropper-icon"
                        />
                      </button>
                      <button
                        onClick={() => toggleTextColor(color.id)}
                        className="icon-btn-hidden"
                        title={`Toggle text color (currently ${color.textColor || 'white'})`}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            fill={color.textColor === 'black' ? '#000000' : '#ffffff'}
                            stroke="#666"
                            strokeWidth="1"
                          />
                        </svg>
                      </button>
                      <button onClick={() => deleteColor(color.id)} className="icon-btn-hidden icon-btn-delete" title="Delete">
                        <Icon icon="x" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addColor} className="add-btn">
                  <Icon icon="plus" size={14} />
                  <span>Add color</span>
                </button>

                <div className="mixed-colors-section">
                  <h3 className="section-subtitle">Mixed Colors</h3>
                  <div className="colors-list">
                    {mixedColors.map((mixedColor) => (
                      <div key={mixedColor.id} className="color-item group">
                        <button
                          onClick={() => {
                            setPaintMode('mixed');
                            setSelectedMixedColor(mixedColor.id);
                          }}
                          className={`color-radio ${paintMode === 'mixed' && selectedMixedColor === mixedColor.id ? 'selected' : ''}`}
                        >
                          {paintMode === 'mixed' && selectedMixedColor === mixedColor.id && <div className="radio-dot"></div>}
                        </button>
                        <button
                          onClick={() => {
                            setPaintMode('mixed');
                            setSelectedMixedColor(mixedColor.id);
                          }}
                          className={`color-swatch ${paintMode === 'mixed' && selectedMixedColor === mixedColor.id ? 'selected' : ''}`}
                          style={{
                            background: `linear-gradient(135deg, ${mixedColor.color1} 0%, ${mixedColor.color1} 50%, ${mixedColor.color2} 50%, ${mixedColor.color2} 100%)`
                          }}
                        ></button>
                        <button className="color-name-btn">{mixedColor.name}</button>
                        <div className="mixed-color-actions">
                          <button
                            onClick={() => setColorPickerTarget({ type: 'mixed1', id: mixedColor.id })}
                            className="mixed-color-box"
                            style={{ backgroundColor: mixedColor.color1 }}
                            title="Change First Color"
                          ></button>
                          <button
                            onClick={() => setColorPickerTarget({ type: 'mixed2', id: mixedColor.id })}
                            className="mixed-color-box"
                            style={{ backgroundColor: mixedColor.color2 }}
                            title="Change Second Color"
                          ></button>
                          <button onClick={() => deleteMixedColor(mixedColor.id)} className="icon-btn-hidden icon-btn-delete" title="Delete">
                            <Icon icon="x" size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={addMixedColor} className="add-btn">
                      <Icon icon="plus" size={14} />
                      <span>Add mixed color</span>
                    </button>
                  </div>
                </div>

                <button onClick={clearAll} className="clear-btn">Clear All</button>
              </div>

              {!trainingMode && (
              <div className="panel">
                <h2 className="panel-title">Range Statistics</h2>
                <div className="stats-main">
                  <div className="stats-header">
                    <span className="stats-label">Range Size</span>
                    <span className="stats-percentage">{calculatePercentage()}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${calculatePercentage()}%` }}></div>
                  </div>
                  <p className="stats-count">
                    {Object.values(getCurrentCellStates()).filter(s => s !== 'default').length} / 169 hands
                  </p>
                </div>
                <div className="stats-list">
                  {colors.map((color) => (
                    <div key={color.id} className="stat-item">
                      <div className="stat-label">
                        <div className="stat-color" style={{ backgroundColor: color.color }}></div>
                        <span>{color.name}</span>
                      </div>
                      <p className="stat-value">
                        {Object.values(getCurrentCellStates()).filter(s => s === color.id).length}
                      </p>
                    </div>
                  ))}
                  {mixedColors.map((mixedColor) => (
                    <div key={mixedColor.id} className="stat-item">
                      <div className="stat-label">
                        <div 
                          className="stat-color" 
                          style={{ 
                            background: `linear-gradient(135deg, ${mixedColor.color1} 0%, ${mixedColor.color1} 50%, ${mixedColor.color2} 50%, ${mixedColor.color2} 100%)`
                          }}
                        ></div>
                        <span>{mixedColor.name}</span>
                      </div>
                      <p className="stat-value">
                        {Object.values(getCurrentCellStates()).filter(s => s === mixedColor.id).length}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pro-tip">
                  <span className="tip-icon">💡</span>
                  <div>
                    <p className="tip-title">Pro Tip</p>
                    <p className="tip-text">
                      Click and drag to paint multiple hands at once. Common ranges: Tight (15-20%), Standard (20-30%), Loose (30-40%)
                    </p>
                  </div>
                </div>
              </div>
              )}

              {trainingMode && !showResults && (
                <TrainingControls
                  onSubmit={submitAttempt}
                  onReset={resetAttempt}
                  elapsedTime={elapsedTime}
                  userAttemptCount={Object.values(userAttempt).filter(v => v && v !== 'default').length}
                />
              )}
              </>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Icon icon="grid-3x3" size={64} className="empty-icon" />
            <p className="empty-title">Select a grid from the sidebar to get started</p>
            <p className="empty-subtitle">or create a new one with the + button</p>
          </div>
        )}
      </div>

      {colorPickerTarget && (
        <ColorPicker
          color={(() => {
            if (colorPickerTarget.type === 'solid') {
              const color = colors.find(c => c.id === colorPickerTarget.id);
              return color ? color.color : '#000000';
            } else if (colorPickerTarget.type === 'mixed1') {
              const mixedColor = mixedColors.find(m => m.id === colorPickerTarget.id);
              return mixedColor ? mixedColor.color1 : '#000000';
            } else if (colorPickerTarget.type === 'mixed2') {
              const mixedColor = mixedColors.find(m => m.id === colorPickerTarget.id);
              return mixedColor ? mixedColor.color2 : '#000000';
            }
            return '#000000';
          })()}
          onChange={(newColor) => {
            if (colorPickerTarget.type === 'solid') {
              updateColorValue(colorPickerTarget.id, newColor);
            } else if (colorPickerTarget.type === 'mixed1') {
              const newMixedColors = mixedColors.map(m => 
                m.id === colorPickerTarget.id ? { ...m, color1: newColor } : m
              );
              setMixedColors(newMixedColors);
              if (user) saveColors(user.uid, colors, newMixedColors);
            } else if (colorPickerTarget.type === 'mixed2') {
              const newMixedColors = mixedColors.map(m => 
                m.id === colorPickerTarget.id ? { ...m, color2: newColor } : m
              );
              setMixedColors(newMixedColors);
              if (user) saveColors(user.uid, colors, newMixedColors);
            }
          }}
          onClose={() => setColorPickerTarget(null)}
        />
      )}
    </div>
  );
}

export default App;