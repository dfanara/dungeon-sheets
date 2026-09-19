interface IconProps {
  className?: string
}

function Icon({ children, className }: Readonly<IconProps & { children: React.ReactNode }>) {
  return (
    <svg className={`icon${className ? ` ${className}` : ''}`} viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export function SelectIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M5 3.5 15.5 12l-4.3.6L13 17l-2 1-2-4.6L5.8 16Z" /></Icon>
}

export function BoxIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="3.5" y="3.5" width="13" height="13" rx="1" /></Icon>
}

export function FieldIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M3.5 13.5h13M4 8.5h7" /></Icon>
}

export function ValueIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="4.5" y="4.5" width="11" height="11" rx="1" /><path d="M7 10h6" /></Icon>
}

export function TrackerIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <circle cx="4.5" cy="10" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10" r="1.4" />
    </Icon>
  )
}

export function TableIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="3.5" y="3.5" width="13" height="13" rx="1" /><path d="M3.5 8.5h13M8.7 3.5v13" /></Icon>
}

export function TextIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M4.5 5.5h11M10 5.5v9" /></Icon>
}

export function RuleIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M3.5 10h13" /></Icon>
}

export const toolIcons = {
  select: SelectIcon,
  box: BoxIcon,
  field: FieldIcon,
  value: ValueIcon,
  tracker: TrackerIcon,
  table: TableIcon,
  text: TextIcon,
  rule: RuleIcon,
}

export function ComponentsIcon(props: Readonly<IconProps>) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="5.5" height="5.5" rx=".5" />
      <rect x="11" y="3.5" width="5.5" height="5.5" rx=".5" />
      <rect x="3.5" y="11" width="5.5" height="5.5" rx=".5" />
      <rect x="11" y="11" width="5.5" height="5.5" rx=".5" />
    </Icon>
  )
}

export function LayoutsIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="3.5" y="3.5" width="13" height="13" rx="1" /><path d="M3.5 8h13M8 8v8.5" /></Icon>
}

export function UndoIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M8 6 4 10l4 4M4 10h7a5 5 0 0 1 0 10h-1" /></Icon>
}

export function RedoIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M12 6l4 4-4 4M16 10H9a5 5 0 0 0 0 10h1" /></Icon>
}

export function FitIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M7 3.5H3.5V7M13 3.5h3.5V7M3.5 13v3.5H7M16.5 13v3.5H13" /></Icon>
}

export function EyeIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M2.5 10S5.5 4.5 10 4.5 17.5 10 17.5 10 14.5 15.5 10 15.5 2.5 10 2.5 10Z" /><circle cx="10" cy="10" r="2.2" /></Icon>
}

export function PanelIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="3.5" y="3.5" width="13" height="13" rx="1" /><path d="M12.5 3.5v13" /></Icon>
}

export function SaveIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M4 3.5h9.5L16.5 6.5V16.5H4Z" /><path d="M6.5 3.5v5h6v-5M6.5 16.5v-5h7v5" /></Icon>
}

export function SheetsIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="6" y="3.5" width="10.5" height="10.5" rx="1" /><path d="M3.5 6.5v10.5h10.5" /></Icon>
}

export function ExportIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M10 3.5v8.5M7 6l3-3 3 3" /><path d="M3.5 12.5v4h13v-4" /></Icon>
}

export function ImportIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M10 3.5v8.5M7 9l3 3 3-3" /><path d="M3.5 12.5v4h13v-4" /></Icon>
}

export function DuplicateIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="6.5" y="6.5" width="10" height="10" rx="1" /><path d="M13.5 6.5v-3h-10v10h3" /></Icon>
}

export function FrontIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="3.5" y="7.5" width="9" height="9" rx="1" opacity=".45" /><rect x="7.5" y="3.5" width="9" height="9" rx="1" /></Icon>
}

export function BackIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="7.5" y="3.5" width="9" height="9" rx="1" opacity=".45" /><rect x="3.5" y="7.5" width="9" height="9" rx="1" /></Icon>
}

export function GroupIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="3.5" y="3.5" width="6.5" height="6.5" rx=".5" /><rect x="10" y="10" width="6.5" height="6.5" rx=".5" /><path d="M9 5.5h1.5A2.5 2.5 0 0 1 13 8v1.5" strokeDasharray="1.6 1.6" /></Icon>
}

export function UngroupIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="3.5" y="3.5" width="6.5" height="6.5" rx=".5" /><rect x="10" y="10" width="6.5" height="6.5" rx=".5" /></Icon>
}

export function DeleteIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M4.5 6h11M8 6V4.2h4V6M6 6l.7 10h6.6L14 6" /></Icon>
}

export function AlignLeftIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M4 3.5v13" /><rect x="4" y="6" width="9" height="3" /><rect x="4" y="11" width="6" height="3" /></Icon>
}

export function AlignTopIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M3.5 4h13" /><rect x="6" y="4" width="3" height="9" /><rect x="11" y="4" width="3" height="6" /></Icon>
}

export function DistributeHIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="2.5" y="6" width="3" height="8" /><rect x="8.5" y="6" width="3" height="8" /><rect x="14.5" y="6" width="3" height="8" /></Icon>
}

export function DistributeVIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><rect x="6" y="2.5" width="8" height="3" /><rect x="6" y="8.5" width="8" height="3" /><rect x="6" y="14.5" width="8" height="3" /></Icon>
}

export function ChevronIcon(props: Readonly<IconProps>) {
  return <Icon {...props}><path d="M6.5 8l3.5 4 3.5-4" /></Icon>
}
