export type ElementType = 
  | 'section'
  | 'container'
  | 'inner-container'
  | 'wrapper'
  | 'heading'
  | 'paragraph'
  | 'text'
  | 'button'
  | 'link'
  | 'image'
  | 'icon'
  | 'card'
  | 'badge'
  | 'divider'
  | 'grid'
  | 'flex'
  | 'form'
  | 'input'
  | 'textarea';

export type Breakpoint = 'desktop' | 'laptop' | 'tablet' | 'mobile';

export interface SpacingValue {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  isLinked?: boolean;
}

export interface CornerRadiusValue {
  topLeft?: string;
  topRight?: string;
  bottomLeft?: string;
  bottomRight?: string;
  isLinked?: boolean;
}

export interface ElementStyles {
  // Dimensions
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  aspectRatio?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  boxSizing?: 'border-box' | 'content-box';

  // Spacing
  margin?: SpacingValue;
  padding?: SpacingValue;
  gap?: string;
  rowGap?: string;
  columnGap?: string;

  // Layout
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
  flexGrow?: string;
  flexShrink?: string;
  flexBasis?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number | string;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textShadow?: string;

  // Appearance
  backgroundColor?: string;
  gradientBackground?: string;
  backgroundImage?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius?: CornerRadiusValue;
  boxShadow?: string;
  opacity?: number | string;
  backdropBlur?: string;
  blur?: string;

  // Transform
  rotation?: string; // e.g. "0deg"
  scale?: string; // e.g. "1"
  transform?: string;

  // Interaction States
  hoverStyles?: Partial<Omit<ElementStyles, 'hoverStyles' | 'responsiveOverrides'>>;
  activeStyles?: Partial<Omit<ElementStyles, 'hoverStyles' | 'responsiveOverrides'>>;
  focusStyles?: Partial<Omit<ElementStyles, 'hoverStyles' | 'responsiveOverrides'>>;

  // Responsive Overrides
  responsiveOverrides?: {
    laptop?: Partial<Omit<ElementStyles, 'responsiveOverrides'>>;
    tablet?: Partial<Omit<ElementStyles, 'responsiveOverrides'>>;
    mobile?: Partial<Omit<ElementStyles, 'responsiveOverrides'>>;
  };
}

export interface ElementAnimation {
  type?: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'zoom-in' | 'scale-up' | 'blur-reveal';
  duration?: number; // seconds
  delay?: number; // seconds
  easing?: string;
  hoverEffect?: 'none' | 'lift' | 'glow' | 'pulse' | 'scale' | 'tilt';
}

export interface ElementConfig {
  id: string;
  type: ElementType;
  name: string;
  parentId: string | null;
  children: string[];
  content?: string;
  href?: string;
  target?: '_self' | '_blank';
  imageSrc?: string;
  imageAlt?: string;
  iconName?: string;
  styles: ElementStyles;
  animation?: ElementAnimation;
  customCss?: string;
  hidden?: boolean;
  locked?: boolean;
  presetKey?: string;
}

export interface GlobalDesignTokens {
  colors: {
    primary: string;
    primaryGlow: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textMuted: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    card: string;
    glow: string;
    modal: string;
  };
}

export interface RevisionCheckpoint {
  id: string;
  timestamp: string;
  name: string;
  config: {
    elements: Record<string, ElementConfig>;
    rootElementIds: string[];
    designTokens: GlobalDesignTokens;
  };
}
