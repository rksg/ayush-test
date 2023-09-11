import { Tabs as AntTabs, TabsProps as AntTabsProps } from 'antd'
import { TabsType as AntTabsType }                    from 'antd/lib/tabs'

import * as UI from './styledComponents'

export type TabsType = 'first' | 'second' | 'third' | Exclude<AntTabsType, 'editable-card'>

export type TabsProps = Omit<AntTabsProps, 'type'> & {
  /** @default 'line' */
  type?: TabsType
  /** @default 'true' */
  scrollToTop?: boolean
}

export function Tabs ({ type, scrollToTop = true, ...props }: TabsProps) {
  const $type = type = type ?? 'line'
  if (type === 'second') type = 'card'
  else if (type === 'third' || type === 'first') type = 'line'

  if (scrollToTop && ($type === 'first' || $type === 'second')) {
    props.onTabClick = props.onTabClick || function () {
      window.scrollTo(0, 0)
    }
  }

  return <UI.Tabs
    {...props}
    type={type as AntTabsType}
    $type={$type} />
}

Tabs.TabPane = AntTabs.TabPane
