import * as SmIcons from './icons/16px'
import * as MdIcons from './icons/24px'
import * as LgIcons from './icons/32px'

export type Size = 'sm' | 'md' | 'lg'
type IconMap = Record<string, React.FC<React.SVGProps<SVGSVGElement>>>

const IconLibraries: Record<Size, IconMap> = {
  sm: SmIcons,
  md: MdIcons,
  lg: LgIcons
}

const IconSizes: Record<Size, string> = {
  sm: '16',
  md: '24',
  lg: '32'
}

type IconProps = {
  size?: Size;
  color?: string;
  style?: React.CSSProperties;
} & React.SVGProps<SVGSVGElement>

const toPascalCase = (str: string) =>
  str.replace(/(^\w|-\w)/g, clearAndUpper)

const clearAndUpper = (text: string) =>
  text.replace(/-/, '').toUpperCase()

const createIconComponent = (iconName: string) => {
  const componentName = toPascalCase(iconName)
  const IconComponent: React.FC<IconProps> = ({ size = 'md', ...props }: IconProps) => {
    const IconLibrary = IconLibraries[size]
    const Icon = IconLibrary[iconName] || (MdIcons as IconMap)[iconName]
    const width = IconSizes[size]
    return <Icon width={width} height={width} {...props} />
  }

  IconComponent.displayName = componentName
  return { [componentName]: IconComponent }
}

export const Icons = Object.keys(MdIcons).reduce((iconList, iconName) => {
  const iconComponent = createIconComponent(iconName)
  return { ...iconList, ...iconComponent }
}, {} as Record<string, React.FC<IconProps>>)
