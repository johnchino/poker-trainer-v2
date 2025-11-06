const fs = require('fs');

const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

// Insert saveColors and loadColors functions after line 96 (after createDefaultFolder)
const colorFunctions = `
  const saveColors = async (userId, solidColors, mixedColorsList) => {
    if (!userId) return;
    try {
      await setDoc(doc(db, \`users/\${userId}/colors\`, 'userColors'), {
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
      const colorsDoc = await getDoc(doc(db, \`users/\${userId}/colors\`, 'userColors'));
      if (colorsDoc.exists()) {
        const data = colorsDoc.data();
        setColors(data.solidColors || []);
        setMixedColors(data.mixedColors || []);
        if (data.solidColors && data.solidColors.length > 0) {
          setSelectedColor(data.solidColors[0].id);
        }
        if (data.mixedColors && data.mixedColors.length > 0) {
          setSelectedMixedColor(data.mixedColors[0].id);
        }
      } else {
        const defaultSolidColors = [
          { id: 'green', name: 'action 1', color: '#5DBA19', enabled: true },
          { id: 'red', name: 'action 2', color: '#B9107A', enabled: true }
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
`;

// Insert after line 96 (after createDefaultFolder closing brace)
lines.splice(97, 0, colorFunctions);

// Add loadColors call in loadUserData (after line 83, now 84 + offset)
const loadUserDataEndIndex = lines.findIndex((line, idx) => idx > 80 && idx < 90 && line.trim() === '}');
lines[loadUserDataEndIndex] = '      await loadColors(userId);\n    }';

// Update addColor function
const addColorIndex = lines.findIndex(line => line.includes('const addColor = () =>'));
const addColorEndIndex = lines.findIndex((line, idx) => idx > addColorIndex && line.trim() === '};');
lines[addColorEndIndex] = `    const newColors = [...colors, newColor];
    setColors(newColors);
    setSelectedColor(newColor.id);
    if (user) saveColors(user.uid, newColors, mixedColors);
  };`;

// Update deleteColor function
const deleteColorIndex = lines.findIndex(line => line.includes('const deleteColor = (colorId)'));
const deleteColorEndIndex = lines.findIndex((line, idx) => idx > deleteColorIndex && line.trim() === '};');
lines[deleteColorEndIndex] = `    const newColors = colors.filter(c => c.id !== colorId);
    setColors(newColors);
    if (selectedColor === colorId && newColors.length > 0) {
      setSelectedColor(newColors[0].id);
    }
    if (user) saveColors(user.uid, newColors, mixedColors);
  };`;

// Update saveColorName function
const saveColorNameIndex = lines.findIndex(line => line.includes('const saveColorName = ()'));
const saveColorNameEndIndex = lines.findIndex((line, idx) => idx > saveColorNameIndex && line.trim() === '};');
lines[saveColorNameEndIndex] = `    const newColors = colors.map(c => c.id === editingColorId ? { ...c, name: editingColorName } : c);
    setColors(newColors);
    setEditingColorId(null);
    setEditingColorName('');
    if (user) saveColors(user.uid, newColors, mixedColors);
  };`;

// Update updateColorValue function
const updateColorValueIndex = lines.findIndex(line => line.includes('const updateColorValue = (colorId, newColor)'));
const updateColorValueEndIndex = lines.findIndex((line, idx) => idx > updateColorValueIndex && line.trim() === '};');
lines[updateColorValueEndIndex] = `    const newColors = colors.map(c => c.id === colorId ? { ...c, color: newColor } : c);
    setColors(newColors);
    if (user) saveColors(user.uid, newColors, mixedColors);
  };`;

// Update addMixedColor function
const addMixedColorIndex = lines.findIndex(line => line.includes('const addMixedColor = ()'));
const addMixedColorEndIndex = lines.findIndex((line, idx) => idx > addMixedColorIndex && line.trim() === '};');
lines[addMixedColorEndIndex] = `    const newMixedColors = [...mixedColors, newMixedColor];
    setMixedColors(newMixedColors);
    setPaintMode('mixed');
    setSelectedMixedColor(newMixedColor.id);
    if (user) saveColors(user.uid, colors, newMixedColors);
  };`;

// Update deleteMixedColor function  
const deleteMixedColorIndex = lines.findIndex(line => line.includes('const deleteMixedColor = (mixedColorId)'));
const deleteMixedColorEndIndex = lines.findIndex((line, idx) => idx > deleteMixedColorIndex && line.trim() === '};');
const deleteMixedLines = lines.slice(deleteMixedColorIndex, deleteMixedColorEndIndex + 1);
const newDeleteMixed = `  const deleteMixedColor = (mixedColorId) => {
    const newMixedColors = mixedColors.filter(m => m.id !== mixedColorId);
    setMixedColors(newMixedColors);
    if (selectedMixedColor === mixedColorId && newMixedColors.length > 0) {
      setSelectedMixedColor(newMixedColors[0].id);
    } else if (newMixedColors.length === 0) {
      setPaintMode('solid');
      setSelectedColor(colors[0]?.id || 'green');
    }
    if (user) saveColors(user.uid, colors, newMixedColors);
  };`;
lines.splice(deleteMixedColorIndex, deleteMixedColorEndIndex - deleteMixedColorIndex + 1, newDeleteMixed);

// Update onChange for mixed colors in ColorPicker (around lines 654-660)
const mixed1ChangeIndex = lines.findIndex(line => line.includes("setMixedColors(mixedColors.map(m =>") && line.includes("color1"));
if (mixed1ChangeIndex > 0) {
  const endIdx = lines.findIndex((line, idx) => idx > mixed1ChangeIndex && line.includes('));'));
  const newCode = `              const newMixedColors = mixedColors.map(m => 
                m.id === colorPickerTarget.id ? { ...m, color1: newColor } : m
              );
              setMixedColors(newMixedColors);
              if (user) saveColors(user.uid, colors, newMixedColors);`;
  lines.splice(mixed1ChangeIndex, endIdx - mixed1ChangeIndex + 1, newCode);
}

const mixed2ChangeIndex = lines.findIndex((line, idx) => idx > mixed1ChangeIndex + 10 && line.includes("setMixedColors(mixedColors.map(m =>") && line.includes("color2"));
if (mixed2ChangeIndex > 0) {
  const endIdx = lines.findIndex((line, idx) => idx > mixed2ChangeIndex && line.includes('));'));
  const newCode = `              const newMixedColors = mixedColors.map(m => 
                m.id === colorPickerTarget.id ? { ...m, color2: newColor } : m
              );
              setMixedColors(newMixedColors);
              if (user) saveColors(user.uid, colors, newMixedColors);`;
  lines.splice(mixed2ChangeIndex, endIdx - mixed2ChangeIndex + 1, newCode);
}

fs.writeFileSync('src/App.jsx', lines.join('\n'));
console.log('File modified successfully');
