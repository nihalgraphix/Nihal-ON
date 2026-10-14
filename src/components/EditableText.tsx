import React from 'react';
import { useStudio } from '../context/StudioContext';

export interface EditableTextProps extends React.HTMLAttributes<HTMLElement> {
  id: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  defaultText?: string;
  children?: React.ReactNode;
  className?: string;
  section?: string;
  label?: string;
  style?: React.CSSProperties;
}

export const EditableText: React.FC<EditableTextProps> = ({
  id,
  as: Component = 'p',
  defaultText = '',
  children,
  className = '',
  section = 'general',
  label,
  style,
  onClick,
  onDoubleClick,
  ...rest
}) => {
  const {
    getTextNode,
    updateTextNode,
    updateElementContent,
    isStudioOpen,
    selectedElementId,
    selectElement,
    draftData,
  } = useStudio();

  const [isEditingInline, setIsEditingInline] = React.useState(false);

  // Extract fallback string if children is plain string or number
  const fallbackText = typeof children === 'string' || typeof children === 'number'
    ? String(children)
    : (defaultText || '');

  const currentText = getTextNode(id, fallbackText);
  const [localVal, setLocalVal] = React.useState(currentText);

  React.useEffect(() => {
    setLocalVal(currentText);
  }, [currentText]);

  // Check typography from Studio configuration
  const elementConfig = draftData?.elements?.[id];
  const typo = elementConfig?.typography;

  const isSelected = isStudioOpen && selectedElementId === id;

  const combinedStyle: React.CSSProperties = {
    whiteSpace: (typo as any)?.whiteSpace || 'pre-line',
    ...style,
    ...(typo?.fontSize ? { fontSize: typo.fontSize } : {}),
    ...(typo?.fontWeight ? { fontWeight: typo.fontWeight } : {}),
    ...(typo?.fontFamily ? { fontFamily: typo.fontFamily } : {}),
    ...(typo?.fontStyle ? { fontStyle: typo.fontStyle } : {}),
    ...(typo?.textDecoration ? { textDecoration: typo.textDecoration } : {}),
    ...(typo?.textTransform ? { textTransform: typo.textTransform } : {}),
    ...(typo?.textColor ? { color: typo.textColor } : {}),
    ...(typo?.lineHeight ? { lineHeight: typo.lineHeight } : {}),
    ...(typo?.letterSpacing ? { letterSpacing: typo.letterSpacing } : {}),
    ...(typo?.textShadow ? { textShadow: typo.textShadow } : {}),
    ...(typo?.textHighlight ? { backgroundColor: typo.textHighlight } : {}),
    ...(typo?.textGradient ? {
      backgroundImage: typo.textGradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    } : {}),
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isStudioOpen) {
      e.stopPropagation();
      selectElement(id);
    }
    if (onClick) onClick(e);
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isStudioOpen) {
      e.stopPropagation();
      selectElement(id);
      setIsEditingInline(true);
    }
    if (onDoubleClick) onDoubleClick(e);
  };

  const handleSaveInline = () => {
    setIsEditingInline(false);
    if (localVal !== currentText) {
      updateTextNode(id, localVal);
      updateElementContent(id, { text: localVal });
    }
  };

  const editableClassNames = [
    className,
    'whitespace-pre-line break-words overflow-wrap-anywhere max-w-full',
    isStudioOpen ? 'transition-colors duration-150 hover:outline-1 hover:outline-dashed hover:outline-cyan-500/60 cursor-pointer' : '',
    isSelected ? 'outline-2 outline-cyan-400 bg-cyan-950/20 rounded-sm' : '',
  ].filter(Boolean).join(' ');

  if (isStudioOpen && isEditingInline) {
    return (
      <div className="relative inline-block w-full z-50">
        <textarea
          autoFocus
          rows={Math.max(2, (localVal.match(/\n/g) || []).length + 2)}
          value={localVal}
          onChange={(e) => setLocalVal(e.target.value)}
          onBlur={handleSaveInline}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSaveInline();
            } else if (e.key === 'Escape') {
              setIsEditingInline(false);
              setLocalVal(currentText);
            }
          }}
          style={combinedStyle}
          className={`${className} whitespace-pre-line bg-[#111214]/95 text-white border-2 border-[#FF5A1F] rounded-lg p-2.5 focus:outline-none ring-2 ring-[#FF5A1F]/50 w-full min-h-[60px] shadow-2xl z-50 resize-y`}
          data-editable-id={id}
          placeholder="Type text... (Press Enter for line break)"
        />
        <div className="flex items-center justify-between text-[10px] font-mono bg-[#17181B] text-[#A1A1AA] border border-[#2C2E34] px-2.5 py-1 rounded-b-md shadow-md mt-0.5">
          <span className="flex items-center gap-1.5">
            <span className="bg-[#FF5A1F]/20 text-[#FF5A1F] px-1 py-0.5 rounded font-bold">Enter</span>
            <span>= New line break</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[#71717A]">Ctrl+Enter = Save</span>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                handleSaveInline();
              }}
              className="bg-[#FF5A1F] hover:bg-[#FF723F] text-black font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer"
            >
              Done ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render text content
  const renderContent = () => {
    if (currentText) {
      return currentText;
    }
    return children || fallbackText;
  };

  return (
    <Component
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={editableClassNames}
      style={combinedStyle}
      data-editable-id={id}
      {...rest}
    >
      {renderContent()}
    </Component>
  );
};

export default EditableText;

