import { Icon } from './Icons';

/**
 * Reusable toolbar for sidebar
 */
export const SidebarToolbar = ({
  onAddFolder,
  onAddGrid,
  exportMode,
  setExportMode,
  onExportData,
  onImportData,
  onLogout
}) => {
  return (
    <div className="sidebar-toolbar">
      <button onClick={onAddFolder} className="toolbar-btn" title="New Folder">
        <Icon icon="plus" size={14} />
        <Icon icon="folder" size={16} />
      </button>
      <button onClick={onAddGrid} className="toolbar-btn" title="New Grid">
        <Icon icon="plus" size={14} />
        <Icon icon="grid-3x3" size={16} />
      </button>
      <button
        onClick={() => {
          if (exportMode) {
            onExportData();
          } else {
            setExportMode(true);
          }
        }}
        className={`toolbar-btn ${exportMode ? 'active' : ''}`}
        title={exportMode ? "Export Selected" : "Export Mode"}
      >
        <Icon icon="upload" size={16} />
      </button>
      <button onClick={onImportData} className="toolbar-btn" title="Import Ranges">
        <Icon icon="import" size={16} />
      </button>
      {exportMode && (
        <button
          onClick={() => setExportMode(false)}
          className="toolbar-btn"
          title="Cancel Export"
        >
          <Icon icon="x" size={14} />
        </button>
      )}
      <div className="toolbar-spacer"></div>
      <button onClick={onLogout} className="toolbar-btn" title="Logout">
        <Icon icon="log-out" size={14} />
      </button>
    </div>
  );
};
