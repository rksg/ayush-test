import { Tabs as AntTabs, TabsProps as AntTabsProps } from 'antd'
import { TabsType as AntTabsType }                    from 'antd/lib/tabs'

import { useLayoutContext } from '../Layout'

import * as UI from './styledComponents'

export type TabsType = 'second' | 'third' | Exclude<AntTabsType, 'editable-card'>

export type TabsProps = Omit<AntTabsProps, 'type'> & {
  /** @default 'line' */
  type?: TabsType
  /** @default 'true' */
  scrollToTop?: boolean
}

export function Tabs ({ type, scrollToTop = true, ...props }: TabsProps) {
  const layout = useLayoutContext()
  const $type = type = type ?? 'line'
  if (type === 'second') type = 'card'
  else if (type === 'third') type = 'line'

  if (scrollToTop && $type === 'second') {
    props.onTabClick = props.onTabClick || function () {
      window.scrollTo(0, 0)
    }
  }

  return <UI.Tabs
    {...props}
    style={{
      ...(props.style ?? {}),
      '--sticky-offset': `${layout.pageHeaderY}px`
    } as React.CSSProperties}
    type={type as AntTabsType}
    $type={$type} />
}

Tabs.TabPane = AntTabs.TabPane
