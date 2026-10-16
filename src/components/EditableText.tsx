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
  style,
  ...rest
}) => {
  const { getTextNode, draftData } = useStudio();

  // Extract fallback string if children is plain string or number
  const fallbackText = typeof children === 'string' || typeof children === 'number'
    ? String(children)
    : (defaultText || '');

  const currentText = getTextNode ? getTextNode(id, fallbackText) : fallbackText;

  // Check typography from Studio configuration
  const elementConfig = draftData?.elements?.[id];
  const typo = elementConfig?.typography;

  const combinedStyle: React.CSSProperties = {
    whiteSpace: style?.whiteSpace || (typo as any)?.whiteSpace || 'pre-line',
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

  const textClassNames = [
    className,
    'max-w-full',
  ].filter(Boolean).join(' ');

  const contentToDisplay = currentText || children || fallbackText;

  return (
    <Component
      className={textClassNames}
      style={combinedStyle}
      data-id={id}
      {...rest}
    >
      {contentToDisplay}
    </Component>
  );
};

export default EditableText;
