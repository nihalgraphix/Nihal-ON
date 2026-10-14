import React, { useState } from 'react';
import LayersPanel from './LayersPanel';
import AddElementPanel from './AddElementPanel';
import CanvasPreview from './CanvasPreview';
import PropertiesInspector from './PropertiesInspector';
import DraggablePanel from './DraggablePanel';
import { Layers, Plus, ChevronLeft, ChevronRight, Move, Sliders, PanelLeft, PanelRight, Maximize2 } from 'lucide-react';

export default function VisualEditorView() {
  const [leftTab, setLeftTab] = useState<'layers' | 'add'>('layers');
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Floating movable panel states
  const [leftFloating, setLeftFloating] = useState(false);
  const [rightFloating, setRightFloating] = useState(false);

  const renderLeftContent = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-panel tabs */}
      <div className="h-10 border-b border-[#2C2E34] flex items-center px-2 gap-1 bg-[#141518] shrink-0">
        <button
          onClick={() => setLeftTab('layers')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            leftTab === 'layers'
              ? 'bg-[#202126] text-white shadow-xs'
              : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layers</span>
        </button>
        <button
          onClick={() => setLeftTab('add')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
            leftTab === 'add'
              ? 'bg-[#202126] text-white shadow-xs'
              : 'text-[#71717A] hover:text-[#A1A1AA]'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {leftTab === 'layers' ? <LayersPanel /> : <AddElementPanel />}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden h-full relative bg-[#111214]">
      {/* Docked Left Sub-Panel: Layers & Add */}
      {!leftFloating && !leftPanelCollapsed && (
        <div className="w-64 bg-[#17181B] border-r border-[#2C2E34] flex flex-col shrink-0 h-full overflow-hidden relative">
          <div className="h-7 px-2 bg-[#1A1C20] border-b border-[#2C2E34] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
            <span>STRUCTURE & ELEMENTS</span>
            <button
              onClick={() => setLeftFloating(true)}
              className="hover:text-white flex items-center gap-1 text-[10px] text-[#FF5A1F] cursor-pointer"
              title="Detach panel as movable window"
            >
              <Move className="w-3 h-3" />
              <span>Float</span>
            </button>
          </div>
          {renderLeftContent()}
        </div>
      )}

      {/* Collapse button for left panel */}
      {!leftFloating && (
        <button
          onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
          className="w-3 bg-[#111214] hover:bg-[#202126] border-r border-[#2C2E34] flex items-center justify-center text-[#71717A] hover:text-white transition-colors cursor-pointer z-10 shrink-0"
          title={leftPanelCollapsed ? 'Expand structure panel' : 'Collapse structure panel'}
        >
          {leftPanelCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      )}

      {/* Floating Movable Left Panel */}
      {leftFloating && (
        <DraggablePanel
          id="left-structure-panel"
          title={leftTab === 'layers' ? 'Page Layers' : 'Add Elements'}
          icon={leftTab === 'layers' ? <Layers className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          isFloating={true}
          onToggleFloating={() => setLeftFloating(false)}
          defaultPos={{ x: 280, y: 70 }}
          defaultWidth={280}
        >
          {renderLeftContent()}
        </DraggablePanel>
      )}

      {/* Floating Quick Floating Dock Bar over Web Canvas */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#17181B]/95 backdrop-blur-md border border-[#2C2E34] px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-mono">
        <span className="text-[10px] text-[#FF5A1F] font-bold uppercase tracking-wider">PANELS:</span>

        {/* Float/Dock Left Panel Button */}
        <button
          onClick={() => {
            if (leftPanelCollapsed) setLeftPanelCollapsed(false);
            setLeftFloating(!leftFloating);
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            leftFloating
              ? 'bg-[#FF5A1F] text-black font-bold shadow-md'
              : 'bg-[#202126] text-[#A1A1AA] hover:text-white border border-[#2C2E34]'
          }`}
          title={leftFloating ? 'Dock Left Panel' : 'Make Left Panel Movable Window'}
        >
          <PanelLeft className="w-3.5 h-3.5" />
          <span>{leftFloating ? 'Left Floating' : 'Float Structure'}</span>
        </button>

        {/* Float/Dock Right Inspector Button */}
        <button
          onClick={() => {
            if (rightPanelCollapsed) setRightPanelCollapsed(false);
            setRightFloating(!rightFloating);
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            rightFloating
              ? 'bg-[#FF5A1F] text-black font-bold shadow-md'
              : 'bg-[#202126] text-[#A1A1AA] hover:text-white border border-[#2C2E34]'
          }`}
          title={rightFloating ? 'Dock Right Inspector' : 'Make Inspector Movable Window'}
        >
          <PanelRight className="w-3.5 h-3.5" />
          <span>{rightFloating ? 'Right Floating' : 'Float Inspector'}</span>
        </button>
      </div>

      {/* Center Live Web Canvas */}
      <CanvasPreview
        onToggleFloatLeft={() => setLeftFloating(!leftFloating)}
        onToggleFloatRight={() => setRightFloating(!rightFloating)}
      />

      {/* Collapse button for right panel */}
      {!rightFloating && (
        <button
          onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          className="w-3 bg-[#111214] hover:bg-[#202126] border-l border-[#2C2E34] flex items-center justify-center text-[#71717A] hover:text-white transition-colors cursor-pointer z-10 shrink-0"
          title={rightPanelCollapsed ? 'Expand Inspector' : 'Collapse Inspector'}
        >
          {rightPanelCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      )}

      {/* Docked Right Sub-Panel: Properties Inspector */}
      {!rightFloating && !rightPanelCollapsed && (
        <div className="w-80 bg-[#17181B] border-l border-[#2C2E34] flex flex-col shrink-0 h-full overflow-hidden relative">
          <div className="h-7 px-2 bg-[#1A1C20] border-b border-[#2C2E34] flex items-center justify-between text-[10px] font-mono text-[#71717A]">
            <span>INSPECTOR & STYLES</span>
            <button
              onClick={() => setRightFloating(true)}
              className="hover:text-white flex items-center gap-1 text-[10px] text-[#FF5A1F] cursor-pointer"
              title="Detach panel as movable window"
            >
              <Move className="w-3 h-3" />
              <span>Float</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <PropertiesInspector />
          </div>
        </div>
      )}

      {/* Floating Movable Right Inspector Panel */}
      {rightFloating && (
        <DraggablePanel
          id="right-inspector-panel"
          title="Properties & Styles Inspector"
          icon={<Sliders className="w-3.5 h-3.5" />}
          isFloating={true}
          onToggleFloating={() => setRightFloating(false)}
          defaultPos={{ x: window.innerWidth - 350, y: 70 }}
          defaultWidth={330}
        >
          <PropertiesInspector />
        </DraggablePanel>
      )}
    </div>
  );
}
