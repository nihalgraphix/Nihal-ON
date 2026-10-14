import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Plus, Type, Heading1, Square, Layout, Image, Divide, Box } from 'lucide-react';
import { EditableElement } from '../../types/studio';

export default function AddElementPanel() {
  const { addElement } = useStudio();

  const elementTemplates: Array<{
    type: EditableElement['type'];
    label: string;
    description: string;
    icon: React.ReactNode;
    factory: () => EditableElement;
  }> = [
    {
      type: 'heading',
      label: 'Heading',
      description: 'Display title with bold typography',
      icon: <Heading1 className="w-4 h-4 text-[#FF5A1F]" />,
      factory: () => ({
        id: `custom_heading_${Date.now()}`,
        label: 'Custom Heading',
        section: 'hero',
        type: 'heading',
        content: { text: 'New Interactive Headline' },
        typography: { fontSize: '42px', fontWeight: '700', textColor: '#FFFFFF', textAlign: 'left' },
        spacing: { marginBottom: '16px' },
        visible: true,
        isCustom: true,
      }),
    },
    {
      type: 'text',
      label: 'Paragraph / Subtext',
      description: 'Body copy and narrative text block',
      icon: <Type className="w-4 h-4 text-[#A1A1AA]" />,
      factory: () => ({
        id: `custom_text_${Date.now()}`,
        label: 'Custom Paragraph',
        section: 'hero',
        type: 'text',
        content: { text: 'Crafting thoughtful digital solutions with unmatched attention to typography and spatial pacing.' },
        typography: { fontSize: '16px', fontWeight: '400', textColor: '#A1A1AA', lineHeight: '1.6' },
        spacing: { marginBottom: '20px' },
        visible: true,
        isCustom: true,
      }),
    },
    {
      type: 'button',
      label: 'Action Button',
      description: 'Call-to-action button or link',
      icon: <Square className="w-4 h-4 text-[#FF8A00]" />,
      factory: () => ({
        id: `custom_btn_${Date.now()}`,
        label: 'Custom Action Button',
        section: 'hero',
        type: 'button',
        content: { text: 'Get in Touch', link: '#contact' },
        typography: { fontSize: '13px', fontWeight: '700', textColor: '#000000' },
        appearance: { backgroundColor: '#FFFFFF', borderRadius: '9999px' },
        spacing: { paddingTop: '12px', paddingBottom: '12px', paddingLeft: '28px', paddingRight: '28px' },
        visible: true,
        isCustom: true,
      }),
    },
    {
      type: 'container',
      label: 'Container Div',
      description: 'Flex / Grid container wrapper',
      icon: <Layout className="w-4 h-4 text-[#3B82F6]" />,
      factory: () => ({
        id: `custom_container_${Date.now()}`,
        label: 'Custom Container',
        section: 'hero',
        type: 'container',
        appearance: { backgroundColor: '#141518', borderColor: '#2C2E34', borderWidth: '1px', borderRadius: '16px' },
        spacing: { paddingTop: '24px', paddingBottom: '24px', paddingLeft: '24px', paddingRight: '24px', marginBottom: '24px' },
        visible: true,
        isCustom: true,
      }),
    },
    {
      type: 'card',
      label: 'Content Card',
      description: 'Card with dark background and border',
      icon: <Box className="w-4 h-4 text-[#10B981]" />,
      factory: () => ({
        id: `custom_card_${Date.now()}`,
        label: 'Custom Feature Card',
        section: 'hero',
        type: 'card',
        content: { text: 'Feature Title', subtext: 'Detailed description of the service or capability.' },
        typography: { fontSize: '20px', fontWeight: '600', textColor: '#FFFFFF' },
        appearance: { backgroundColor: '#17181B', borderColor: '#2C2E34', borderWidth: '1px', borderRadius: '12px' },
        spacing: { paddingTop: '20px', paddingBottom: '20px', paddingLeft: '20px', paddingRight: '20px' },
        visible: true,
        isCustom: true,
      }),
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#17181B] border-r border-[#2C2E34] select-none text-xs p-3">
      <div className="font-mono uppercase text-[10px] font-bold text-[#71717A] mb-3">
        Insert Elements
      </div>
      <div className="space-y-2">
        {elementTemplates.map((tmpl, idx) => (
          <button
            key={idx}
            onClick={() => addElement(tmpl.factory())}
            className="w-full flex items-start gap-3 p-2.5 rounded-md bg-[#202126] hover:bg-[#25272D] border border-[#2C2E34] transition-all text-left cursor-pointer group"
          >
            <div className="mt-0.5 p-1.5 rounded bg-[#111214] border border-[#2C2E34] group-hover:border-[#FF5A1F]/40 transition-colors">
              {tmpl.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-[#F4F4F5] group-hover:text-white">
                {tmpl.label}
              </p>
              <p className="text-[11px] text-[#71717A] leading-tight mt-0.5">
                {tmpl.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
