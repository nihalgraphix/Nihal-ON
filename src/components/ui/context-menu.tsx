import * as React from "react"
import { ContextMenu as BaseContextMenu } from "@base-ui/react"
import { Check, ChevronRight, Circle } from "lucide-react"

export const ContextMenu = BaseContextMenu.Root
export const ContextMenuTrigger = BaseContextMenu.Trigger
export const ContextMenuGroup = BaseContextMenu.Group
export const ContextMenuPortal = BaseContextMenu.Portal
export const ContextMenuSub = BaseContextMenu.SubmenuRoot
export const ContextMenuRadioGroup = BaseContextMenu.RadioGroup

export function ContextMenuContent({
  className = "",
  children,
  sideOffset = 4,
  alignOffset = 0,
  ...props
}: {
  className?: string
  children: React.ReactNode
  sideOffset?: number
  alignOffset?: number
  [key: string]: any
}) {
  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className="z-[999999] pointer-events-auto"
      >
        <BaseContextMenu.Popup
          className={`z-[999999] min-w-[13.5rem] overflow-hidden rounded-2xl border-0 border-none outline-none ring-0 bg-[#0c0d10]/96 p-1.5 text-neutral-200 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-3xl transform-gpu transition-all duration-200 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 select-none ${className}`}
          {...props}
        >
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  )
}

export function ContextMenuItem({
  className = "",
  inset = false,
  variant = "default",
  children,
  ...props
}: {
  className?: string
  inset?: boolean
  variant?: "default" | "destructive"
  children: React.ReactNode
  [key: string]: any
}) {
  return (
    <BaseContextMenu.Item
      className={`relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-xs font-medium outline-none border-0 border-none ring-0 transition-all duration-200 ease-out data-[disabled]:pointer-events-none data-[disabled]:opacity-40 hover:bg-white/10 hover:text-white hover:translate-x-1 data-[highlighted]:bg-white/10 data-[highlighted]:text-white data-[highlighted]:translate-x-1 active:scale-[0.98] ${
        variant === "destructive"
          ? "text-rose-400 hover:bg-rose-500/15 hover:text-rose-300"
          : "text-neutral-300"
      } ${inset ? "pl-8" : ""} ${className}`}
      {...props}
    >
      {children}
    </BaseContextMenu.Item>
  )
}

export function ContextMenuCheckboxItem({
  className = "",
  children,
  checked,
  ...props
}: {
  className?: string
  children: React.ReactNode
  checked?: boolean
  [key: string]: any
}) {
  return (
    <BaseContextMenu.CheckboxItem
      checked={checked}
      className={`relative flex cursor-pointer select-none items-center rounded-xl py-2 pl-8 pr-3 text-xs font-medium text-neutral-300 outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 hover:bg-white/10 hover:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white ${className}`}
      {...props}
    >
      <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
        <BaseContextMenu.CheckboxItemIndicator>
          <Check className="h-3.5 w-3.5 text-[#FF5A1F]" />
        </BaseContextMenu.CheckboxItemIndicator>
      </span>
      {children}
    </BaseContextMenu.CheckboxItem>
  )
}

export function ContextMenuRadioItem({
  className = "",
  children,
  value = "",
  ...props
}: {
  className?: string
  children: React.ReactNode
  value?: any
  [key: string]: any
}) {
  return (
    <BaseContextMenu.RadioItem
      value={value}
      className={`relative flex cursor-pointer select-none items-center rounded-xl py-2 pl-8 pr-3 text-xs font-medium text-neutral-300 outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-40 hover:bg-white/10 hover:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white ${className}`}
      {...props}
    >
      <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
        <BaseContextMenu.RadioItemIndicator>
          <Circle className="h-2 w-2 fill-[#FF5A1F] text-[#FF5A1F]" />
        </BaseContextMenu.RadioItemIndicator>
      </span>
      {children}
    </BaseContextMenu.RadioItem>
  )
}

export function ContextMenuLabel({
  className = "",
  inset = false,
  children,
  ...props
}: {
  className?: string
  inset?: boolean
  children: React.ReactNode
  [key: string]: any
}) {
  return (
    <BaseContextMenu.GroupLabel
      className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest font-bold text-neutral-400 select-none ${
        inset ? "pl-8" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </BaseContextMenu.GroupLabel>
  )
}

export function ContextMenuSeparator({
  className = "",
  ...props
}: {
  className?: string
  [key: string]: any
}) {
  return (
    <BaseContextMenu.Separator
      className={`-mx-1 my-1.5 h-px bg-white/6 border-0 border-none outline-none ${className}`}
      {...props}
    />
  )
}

export function ContextMenuShortcut({
  className = "",
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
  [key: string]: any
}) {
  return (
    <span
      className={`ml-auto text-[10px] tracking-wider font-mono text-neutral-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 select-none ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export function ContextMenuSubTrigger({
  className = "",
  inset = false,
  children,
  ...props
}: {
  className?: string
  inset?: boolean
  children: React.ReactNode
  [key: string]: any
}) {
  return (
    <BaseContextMenu.SubmenuTrigger
      className={`flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-neutral-300 outline-none transition-colors hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white ${
        inset ? "pl-8" : ""
      } ${className}`}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-3.5 w-3.5 text-neutral-400" />
    </BaseContextMenu.SubmenuTrigger>
  )
}

export function ContextMenuSubContent({
  className = "",
  children,
  sideOffset = 4,
  ...props
}: {
  className?: string
  children: React.ReactNode
  sideOffset?: number
  [key: string]: any
}) {
  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner sideOffset={sideOffset}>
        <BaseContextMenu.Popup
          className={`z-[99999] min-w-[12rem] overflow-hidden rounded-2xl border border-white/15 bg-[#121316]/95 p-1.5 text-neutral-200 shadow-2xl shadow-black/90 backdrop-blur-2xl transition-all duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out ${className}`}
          {...props}
        >
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  )
}
