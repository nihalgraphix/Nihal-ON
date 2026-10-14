import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useStudio as useMainStudio } from '../context/StudioContext';
import { ElementConfig, ElementStyles, Breakpoint, GlobalDesignTokens, RevisionCheckpoint, ElementType } from './types';
import { DEFAULT_ELEMENTS, DEFAULT_ROOT_ELEMENT_IDS, DEFAULT_DESIGN_TOKENS } from './defaultConfig';

export type StudioTab = 'layers' | 'add' | 'cms' | 'design-tokens' | 'assets' | 'settings';
export type SaveStatus = 'editing' | 'saving' | 'saved' | 'publishing' | 'published' | 'error';

interface StudioContextType {
  mode: 'view' | 'edit';
  setMode: (mode: 'view' | 'edit') => void;
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  selectedElementId: string | null;
  hoveredElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  setHoveredElementId: (id: string | null) => void;
  viewport: Breakpoint;
  setViewport: (vp: Breakpoint) => void;
  zoom: number;
  setZoom: (z: number) => void;
  
  elements: Record<string, ElementConfig>;
  rootElementIds: string[];
  designTokens: GlobalDesignTokens;
  saveStatus: SaveStatus;
  lastSavedTime: string | null;
  copiedStyles: Partial<ElementStyles> | null;

  // History
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Actions
  updateElementStyle: (id: string, updates: Partial<ElementStyles>, targetBreakpoint?: Breakpoint) => void;
  updateElementContent: (id: string, content: string) => void;
  updateElementHref: (id: string, href: string) => void;
  updateElementImage: (id: string, imageSrc: string, imageAlt?: string) => void;
  updateElementAnimation: (id: string, anim: ElementConfig['animation']) => void;
  updateElementCustomCss: (id: string, css: string) => void;
  renameElement: (id: string, name: string) => void;
  toggleHideElement: (id: string) => void;
  toggleLockElement: (id: string) => void;
  
  // DOM manipulations
  addElement: (type: ElementType, parentId?: string | null, customProps?: Partial<ElementConfig>) => string;
  duplicateElement: (id: string) => string | null;
  deleteElement: (id: string) => void;
  reorderElements: (parentId: string | null, fromIndex: number, toIndex: number) => void;
  moveElementToContainer: (elementId: string, newParentId: string | null) => void;
  copyStyle: (id: string) => void;
  pasteStyle: (targetId: string) => void;
  resetElementStyles: (id: string) => void;
  
  // Design system
  updateDesignToken: (category: keyof GlobalDesignTokens, key: string, value: string) => void;
  
  // Persistence & Publishing
  saveDraft: () => Promise<void>;
  publishChanges: () => Promise<void>;
  createCheckpoint: (name?: string) => Promise<void>;
  restoreCheckpoint: (config: { elements: Record<string, ElementConfig>; rootElementIds: string[]; designTokens: GlobalDesignTokens }) => void;
  exportConfigJson: () => string;
  importConfigJson: (jsonStr: string) => boolean;

  // Modals
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  isRevisionsOpen: boolean;
  setIsRevisionsOpen: (open: boolean) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [activeTab, setActiveTab] = useState<StudioTab>('layers');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Breakpoint>('desktop');
  const [zoom, setZoom] = useState<number>(100);

  const [elements, setElements] = useState<Record<string, ElementConfig>>(DEFAULT_ELEMENTS);
  const [rootElementIds, setRootElementIds] = useState<string[]>(DEFAULT_ROOT_ELEMENT_IDS);
  const [designTokens, setDesignTokens] = useState<GlobalDesignTokens>(DEFAULT_DESIGN_TOKENS);
  
  const [copiedStyles, setCopiedStyles] = useState<Partial<ElementStyles> | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isRevisionsOpen, setIsRevisionsOpen] = useState<boolean>(false);

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<Array<{ elements: Record<string, ElementConfig>; rootElementIds: string[] }>>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);

  // Push state into undo history stack
  const pushHistory = useCallback((newElements: Record<string, ElementConfig>, newRoots: string[]) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyPointer + 1);
      return [...sliced, { elements: newElements, rootElementIds: newRoots }];
    });
    setHistoryPointer((prev) => prev + 1);
    setSaveStatus('editing');
  }, [historyPointer]);

  // Load saved configuration from server or localStorage on mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/website-config');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.config) {
            if (data.config.elements) setElements(data.config.elements);
            if (data.config.rootElementIds) setRootElementIds(data.config.rootElementIds);
            if (data.config.designTokens) setDesignTokens(data.config.designTokens);
            if (data.config.updatedAt) setLastSavedTime(new Date(data.config.updatedAt).toLocaleTimeString());
          }
        }
      } catch (err) {
        console.warn('Fallback to local storage for website config:', err);
        const local = localStorage.getItem('studio_website_config');
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.elements) setElements(parsed.elements);
            if (parsed.rootElementIds) setRootElementIds(parsed.rootElementIds);
            if (parsed.designTokens) setDesignTokens(parsed.designTokens);
          } catch (e) {}
        }
      }
    }
    loadConfig();
  }, []);

  // Keyboard shortcut listeners (Ctrl+Z, Ctrl+Y, Ctrl+S, Escape, Delete, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        setSelectedElementId(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      } else if (e.key === '?' || ((e.metaKey || e.ctrlKey) && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyPointer, history]);

  const undo = () => {
    if (historyPointer > 0) {
      const prevStep = history[historyPointer - 1];
      setElements(prevStep.elements);
      setRootElementIds(prevStep.rootElementIds);
      setHistoryPointer(historyPointer - 1);
    }
  };

  const redo = () => {
    if (historyPointer < history.length - 1) {
      const nextStep = history[historyPointer + 1];
      setElements(nextStep.elements);
      setRootElementIds(nextStep.rootElementIds);
      setHistoryPointer(historyPointer + 1);
    }
  };

  const updateElementStyle = (id: string, updates: Partial<ElementStyles>, targetBreakpoint?: Breakpoint) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;

      let newStyles = { ...current.styles };
      const bp = targetBreakpoint || viewport;

      if (bp === 'desktop') {
        newStyles = { ...newStyles, ...updates };
      } else {
        const overrides = newStyles.responsiveOverrides || {};
        newStyles.responsiveOverrides = {
          ...overrides,
          [bp]: { ...(overrides[bp as keyof typeof overrides] || {}), ...updates }
        };
      }

      const updated = {
        ...prev,
        [id]: {
          ...current,
          styles: newStyles
        }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const updateElementContent = (id: string, content: string) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const updated = {
        ...prev,
        [id]: { ...current, content }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const updateElementHref = (id: string, href: string) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const updated = {
        ...prev,
        [id]: { ...current, href }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const updateElementImage = (id: string, imageSrc: string, imageAlt?: string) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const updated = {
        ...prev,
        [id]: { ...current, imageSrc, imageAlt: imageAlt !== undefined ? imageAlt : current.imageAlt }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const updateElementAnimation = (id: string, anim: ElementConfig['animation']) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const updated = {
        ...prev,
        [id]: { ...current, animation: anim }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const updateElementCustomCss = (id: string, css: string) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const updated = {
        ...prev,
        [id]: { ...current, customCss: css }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const renameElement = (id: string, name: string) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const updated = {
        ...prev,
        [id]: { ...current, name }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const toggleHideElement = (id: string) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const updated = {
        ...prev,
        [id]: { ...current, hidden: !current.hidden }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const toggleLockElement = (id: string) => {
    setElements((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const updated = {
        ...prev,
        [id]: { ...current, locked: !current.locked }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const addElement = (type: ElementType, parentId?: string | null, customProps?: Partial<ElementConfig>): string => {
    const newId = `elem_${type}_${Date.now()}`;
    const targetParentId = parentId !== undefined ? parentId : selectedElementId;

    const newElem: ElementConfig = {
      id: newId,
      type,
      name: customProps?.name || `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      parentId: targetParentId,
      children: [],
      content: customProps?.content || (type === 'button' ? 'Click Me' : type === 'heading' ? 'New Heading' : type === 'paragraph' ? 'Sample paragraph text goes here...' : undefined),
      href: customProps?.href,
      imageSrc: customProps?.imageSrc,
      styles: {
        padding: { top: '1rem', right: '1rem', bottom: '1rem', left: '1rem' },
        ...(customProps?.styles || {})
      },
      ...(customProps || {})
    };

    let newElements = { ...elements, [newId]: newElem };
    let newRoots = [...rootElementIds];

    if (targetParentId && newElements[targetParentId]) {
      const parentElem = newElements[targetParentId];
      newElements[targetParentId] = {
        ...parentElem,
        children: [...parentElem.children, newId]
      };
    } else {
      newRoots.push(newId);
    }

    setElements(newElements);
    setRootElementIds(newRoots);
    setSelectedElementId(newId);
    pushHistory(newElements, newRoots);
    return newId;
  };

  const duplicateElement = (id: string): string | null => {
    const orig = elements[id];
    if (!orig) return null;

    const dupId = `elem_${orig.type}_${Date.now()}`;
    const dupElem: ElementConfig = {
      ...orig,
      id: dupId,
      name: `${orig.name} (Copy)`,
      children: []
    };

    let newElements = { ...elements, [dupId]: dupElem };
    let newRoots = [...rootElementIds];

    if (orig.parentId && newElements[orig.parentId]) {
      const p = newElements[orig.parentId];
      const idx = p.children.indexOf(id);
      const newChildren = [...p.children];
      newChildren.splice(idx + 1, 0, dupId);
      newElements[orig.parentId] = { ...p, children: newChildren };
    } else {
      const idx = newRoots.indexOf(id);
      newRoots.splice(idx + 1, 0, dupId);
    }

    setElements(newElements);
    setRootElementIds(newRoots);
    setSelectedElementId(dupId);
    pushHistory(newElements, newRoots);
    return dupId;
  };

  const deleteElement = (id: string) => {
    const elem = elements[id];
    if (!elem) return;

    let newElements = { ...elements };
    delete newElements[id];

    let newRoots = rootElementIds.filter((r) => r !== id);

    if (elem.parentId && newElements[elem.parentId]) {
      const p = newElements[elem.parentId];
      newElements[elem.parentId] = {
        ...p,
        children: p.children.filter((c) => c !== id)
      };
    }

    setElements(newElements);
    setRootElementIds(newRoots);
    if (selectedElementId === id) setSelectedElementId(null);
    pushHistory(newElements, newRoots);
  };

  const reorderElements = (parentId: string | null, fromIndex: number, toIndex: number) => {
    if (parentId && elements[parentId]) {
      const p = elements[parentId];
      const newChildren = [...p.children];
      const [moved] = newChildren.splice(fromIndex, 1);
      newChildren.splice(toIndex, 0, moved);

      const newElements = {
        ...elements,
        [parentId]: { ...p, children: newChildren }
      };
      setElements(newElements);
      pushHistory(newElements, rootElementIds);
    } else {
      const newRoots = [...rootElementIds];
      const [moved] = newRoots.splice(fromIndex, 1);
      newRoots.splice(toIndex, 0, moved);

      setRootElementIds(newRoots);
      pushHistory(elements, newRoots);
    }
  };

  const moveElementToContainer = (elementId: string, newParentId: string | null) => {
    const elem = elements[elementId];
    if (!elem || elem.parentId === newParentId) return;

    let newElements = { ...elements };
    let newRoots = [...rootElementIds];

    // Remove from old parent
    if (elem.parentId && newElements[elem.parentId]) {
      const oldP = newElements[elem.parentId];
      newElements[elem.parentId] = {
        ...oldP,
        children: oldP.children.filter((c) => c !== elementId)
      };
    } else {
      newRoots = newRoots.filter((r) => r !== elementId);
    }

    // Attach to new parent
    newElements[elementId] = { ...elem, parentId: newParentId };

    if (newParentId && newElements[newParentId]) {
      const newP = newElements[newParentId];
      newElements[newParentId] = {
        ...newP,
        children: [...newP.children, elementId]
      };
    } else {
      newRoots.push(elementId);
    }

    setElements(newElements);
    setRootElementIds(newRoots);
    pushHistory(newElements, newRoots);
  };

  const copyStyle = (id: string) => {
    const elem = elements[id];
    if (elem) setCopiedStyles({ ...elem.styles });
  };

  const pasteStyle = (targetId: string) => {
    if (!copiedStyles || !elements[targetId]) return;
    updateElementStyle(targetId, copiedStyles);
  };

  const resetElementStyles = (id: string) => {
    const defaultStyles = DEFAULT_ELEMENTS[id]?.styles || {
      padding: { top: '1rem', right: '1rem', bottom: '1rem', left: '1rem' }
    };
    setElements((prev) => {
      if (!prev[id]) return prev;
      const updated = {
        ...prev,
        [id]: { ...prev[id], styles: defaultStyles, responsiveOverrides: undefined }
      };
      pushHistory(updated, rootElementIds);
      return updated;
    });
  };

  const updateDesignToken = (category: keyof GlobalDesignTokens, key: string, value: string) => {
    setDesignTokens((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setSaveStatus('editing');
  };

  const saveDraft = async () => {
    setSaveStatus('saving');
    const payload = {
      elements,
      rootElementIds,
      designTokens,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('studio_website_config', JSON.stringify(payload));

    try {
      const res = await fetch('/api/website-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: payload })
      });
      if (res.ok) {
        const time = new Date().toLocaleTimeString();
        setSaveStatus('saved');
        setLastSavedTime(time);
      } else {
        setSaveStatus('saved'); // Local saved
      }
    } catch (err) {
      setSaveStatus('saved');
    }
  };

  const publishChanges = async () => {
    setSaveStatus('publishing');
    const payload = {
      elements,
      rootElementIds,
      designTokens,
      publishedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/website-config/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: payload })
      });
      if (res.ok) {
        setSaveStatus('published');
        setLastSavedTime(new Date().toLocaleTimeString());
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const createCheckpoint = async (name?: string) => {
    const payload = {
      elements,
      rootElementIds,
      designTokens
    };
    try {
      await fetch('/api/website-config/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, config: payload })
      });
    } catch (e) {}
  };

  const restoreCheckpoint = (config: { elements: Record<string, ElementConfig>; rootElementIds: string[]; designTokens: GlobalDesignTokens }) => {
    if (config.elements) setElements(config.elements);
    if (config.rootElementIds) setRootElementIds(config.rootElementIds);
    if (config.designTokens) setDesignTokens(config.designTokens);
    pushHistory(config.elements, config.rootElementIds);
  };

  const exportConfigJson = () => {
    return JSON.stringify({ elements, rootElementIds, designTokens }, null, 2);
  };

  const importConfigJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.elements && parsed.rootElementIds) {
        setElements(parsed.elements);
        setRootElementIds(parsed.rootElementIds);
        if (parsed.designTokens) setDesignTokens(parsed.designTokens);
        pushHistory(parsed.elements, parsed.rootElementIds);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <StudioContext.Provider
      value={{
        mode,
        setMode,
        activeTab,
        setActiveTab,
        selectedElementId,
        hoveredElementId,
        setSelectedElementId,
        setHoveredElementId,
        viewport,
        setViewport,
        zoom,
        setZoom,
        elements,
        rootElementIds,
        designTokens,
        saveStatus,
        lastSavedTime,
        copiedStyles,
        canUndo: historyPointer > 0,
        canRedo: historyPointer < history.length - 1,
        undo,
        redo,
        updateElementStyle,
        updateElementContent,
        updateElementHref,
        updateElementImage,
        updateElementAnimation,
        updateElementCustomCss,
        renameElement,
        toggleHideElement,
        toggleLockElement,
        addElement,
        duplicateElement,
        deleteElement,
        reorderElements,
        moveElementToContainer,
        copyStyle,
        pasteStyle,
        resetElementStyles,
        updateDesignToken,
        saveDraft,
        publishChanges,
        createCheckpoint,
        restoreCheckpoint,
        exportConfigJson,
        importConfigJson,
        isShortcutsOpen,
        setIsShortcutsOpen,
        isRevisionsOpen,
        setIsRevisionsOpen
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (context) return context;
  try {
    const mainCtx = useMainStudio();
    if (mainCtx) return mainCtx as any;
  } catch (e) {
    // ignore fallback error
  }
  throw new Error('useStudio must be used within a StudioProvider');
};
