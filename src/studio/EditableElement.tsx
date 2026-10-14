import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from './StudioContext';
import { ElementStyles, Breakpoint } from './types';

interface EditableElementProps {
  id: string;
  className?: string;
  children?: React.ReactNode;
  fallbackContent?: React.ReactNode;
  as?: React.ElementType;
}

export const EditableElement: React.FC<EditableElementProps> = ({
  id,
  className = '',
  children,
  fallbackContent,
  as: Component = 'div'
}) => {
  const {
    mode,
    elements,
    selectedElementId,
    hoveredElementId,
    setSelectedElementId,
    setHoveredElementId,
    viewport,
    updateElementContent
  } = useStudio();

  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const inlineInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const elem = elements[id];
  const isSelected = mode === 'edit' && selectedElementId === id;
  const isHovered = mode === 'edit' && hoveredElementId === id && !isSelected;

  useEffect(() => {
    if (isInlineEditing && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [isInlineEditing]);

  if (!elem) {
    // If element is not in configuration yet, render default children cleanly
    return <Component className={className}>{children || fallbackContent}</Component>;
  }

  if (elem.hidden && mode === 'view') {
    return null;
  }

  // Helper to compile CSS styles from element config with responsive overrides
  const computeStyles = (styles: ElementStyles, currentBp: Breakpoint): React.CSSProperties => {
    let base = { ...styles };
    const overrides = base.responsiveOverrides;

    if (currentBp !== 'desktop' && overrides) {
      if (currentBp === 'laptop' && overrides.laptop) {
        base = { ...base, ...overrides.laptop };
      } else if (currentBp === 'tablet') {
        if (overrides.laptop) base = { ...base, ...overrides.laptop };
        if (overrides.tablet) base = { ...base, ...overrides.tablet };
      } else if (currentBp === 'mobile') {
        if (overrides.laptop) base = { ...base, ...overrides.laptop };
        if (overrides.tablet) base = { ...base, ...overrides.tablet };
        if (overrides.mobile) base = { ...base, ...overrides.mobile };
      }
    }

    const css: React.CSSProperties = {};

    if (base.width) css.width = base.width;
    if (base.height) css.height = base.height;
    if (base.minWidth) css.minWidth = base.minWidth;
    if (base.maxWidth) css.maxWidth = base.maxWidth;
    if (base.minHeight) css.minHeight = base.minHeight;
    if (base.maxHeight) css.maxHeight = base.maxHeight;
    if (base.aspectRatio) css.aspectRatio = base.aspectRatio;
    if (base.overflow) css.overflow = base.overflow;

    if (base.margin) {
      if (base.margin.top) css.marginTop = base.margin.top;
      if (base.margin.right) css.marginRight = base.margin.right;
      if (base.margin.bottom) css.marginBottom = base.margin.bottom;
      if (base.margin.left) css.marginLeft = base.margin.left;
    }

    if (base.padding) {
      if (base.padding.top) css.paddingTop = base.padding.top;
      if (base.padding.right) css.paddingRight = base.padding.right;
      if (base.padding.bottom) css.paddingBottom = base.padding.bottom;
      if (base.padding.left) css.paddingLeft = base.padding.left;
    }

    if (base.gap) css.gap = base.gap;
    if (base.rowGap) css.rowGap = base.rowGap;
    if (base.columnGap) css.columnGap = base.columnGap;

    if (base.display) css.display = base.display;
    if (base.flexDirection) css.flexDirection = base.flexDirection;
    if (base.flexWrap) css.flexWrap = base.flexWrap;
    if (base.justifyContent) css.justifyContent = base.justifyContent;
    if (base.alignItems) css.alignItems = base.alignItems;
    if (base.alignContent) css.alignContent = base.alignContent;
    if (base.flexGrow) css.flexGrow = base.flexGrow;
    if (base.flexShrink) css.flexShrink = base.flexShrink;
    if (base.flexBasis) css.flexBasis = base.flexBasis;
    if (base.gridTemplateColumns) css.gridTemplateColumns = base.gridTemplateColumns;
    if (base.gridTemplateRows) css.gridTemplateRows = base.gridTemplateRows;

    if (base.position) css.position = base.position;
    if (base.top) css.top = base.top;
    if (base.right) css.right = base.right;
    if (base.bottom) css.bottom = base.bottom;
    if (base.left) css.left = base.left;
    if (base.zIndex) css.zIndex = Number(base.zIndex);

    if (base.fontFamily) css.fontFamily = base.fontFamily;
    if (base.fontSize) css.fontSize = base.fontSize;
    if (base.fontWeight) css.fontWeight = base.fontWeight;
    if (base.fontStyle) css.fontStyle = base.fontStyle;
    if (base.color) css.color = base.color;
    if (base.textAlign) css.textAlign = base.textAlign;
    if (base.lineHeight) css.lineHeight = base.lineHeight;
    if (base.letterSpacing) css.letterSpacing = base.letterSpacing;
    if (base.textTransform) css.textTransform = base.textTransform;
    if (base.textDecoration) css.textDecoration = base.textDecoration;
    if (base.textShadow) css.textShadow = base.textShadow;

    if (base.backgroundColor) css.backgroundColor = base.backgroundColor;
    if (base.gradientBackground) css.background = base.gradientBackground;
    if (base.backgroundImage) css.backgroundImage = `url(${base.backgroundImage})`;

    if (base.borderColor) css.borderColor = base.borderColor;
    if (base.borderWidth) css.borderWidth = base.borderWidth;
    if (base.borderStyle) css.borderStyle = base.borderStyle;

    if (base.borderRadius) {
      if (base.borderRadius.topLeft) css.borderTopLeftRadius = base.borderRadius.topLeft;
      if (base.borderRadius.topRight) css.borderTopRightRadius = base.borderRadius.topRight;
      if (base.borderRadius.bottomLeft) css.borderBottomLeftRadius = base.borderRadius.bottomLeft;
      if (base.borderRadius.bottomRight) css.borderBottomRightRadius = base.borderRadius.bottomRight;
    }

    if (base.boxShadow) css.boxShadow = base.boxShadow;
    if (base.opacity !== undefined) css.opacity = Number(base.opacity);

    if (base.transform || base.rotation || base.scale) {
      const parts = [];
      if (base.transform) parts.push(base.transform);
      if (base.rotation) parts.push(`rotate(${base.rotation})`);
      if (base.scale) parts.push(`scale(${base.scale})`);
      css.transform = parts.join(' ');
    }

    return css;
  };

  const compiledStyles = computeStyles(elem.styles, viewport);

  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'edit') {
      e.preventDefault();
      e.stopPropagation();
      setSelectedElementId(id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (mode === 'edit' && ['heading', 'paragraph', 'text', 'button', 'badge'].includes(elem.type)) {
      e.preventDefault();
      e.stopPropagation();
      setIsInlineEditing(true);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (mode === 'edit') {
      e.stopPropagation();
      setHoveredElementId(id);
    }
  };

  const handleMouseLeave = () => {
    if (mode === 'edit') {
      setHoveredElementId(null);
    }
  };

  // Render element content (either text content or children)
  const renderInnerContent = () => {
    if (isInlineEditing) {
      return (
        <textarea
          ref={inlineInputRef as any}
          value={elem.content || ''}
          onChange={(e) => updateElementContent(id, e.target.value)}
          onBlur={() => setIsInlineEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setIsInlineEditing(false);
            }
          }}
          className="bg-black/90 text-white border-2 border-[#FF5A1F] rounded p-1 font-sans text-sm outline-none w-full min-h-[40px] z-50"
        />
      );
    }

    if (elem.content !== undefined && elem.content !== '') {
      return elem.content;
    }

    return children || fallbackContent;
  };

  const editOutlineStyle = mode === 'edit' ? {
    outline: isSelected
      ? '2px solid #FF5A1F'
      : isHovered
      ? '1px dashed #38BDF8'
      : elem.hidden
      ? '1px dashed rgba(255,255,255,0.2)'
      : undefined,
    outlineOffset: '-2px',
    cursor: mode === 'edit' ? 'pointer' : undefined,
    opacity: elem.hidden ? 0.4 : compiledStyles.opacity
  } : {};

  const CombinedComponent = elem.type === 'button' ? 'button' : elem.type === 'link' ? 'a' : Component;

  return (
    <CombinedComponent
      id={id}
      style={{ ...compiledStyles, ...editOutlineStyle }}
      className={`relative transition-all duration-150 ${className}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      href={elem.href && mode === 'view' ? elem.href : undefined}
    >
      {/* Visual Badge Indicator on Canvas in Studio Mode */}
      {mode === 'edit' && (isSelected || isHovered) && (
        <span
          className={`absolute -top-6 left-0 z-[100] px-2 py-0.5 text-[10px] font-mono font-bold rounded shadow-md pointer-events-none select-none flex items-center gap-1 ${
            isSelected ? 'bg-[#FF5A1F] text-black' : 'bg-[#0284C7] text-white'
          }`}
        >
          <span>{elem.name || elem.type}</span>
          <span className="opacity-75 text-[8px]">#{id}</span>
        </span>
      )}

      {renderInnerContent()}
    </CombinedComponent>
  );
};
