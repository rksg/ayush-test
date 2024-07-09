import { Tabs as AntTabs, TabsProps as AntTabsProps } from 'antd'
import { TabsType as AntTabsType }                    from 'antd/lib/tabs'

import * as UI from './styledComponents'

export type TabsType = 'third' | Exclude<AntTabsType, 'editable-card'>

export type TabsProps = Omit<AntTabsProps, 'type'> & {
  /** @default 'line' */
  type?: TabsType
  /** @default 'true' */
  stickyTop?: boolean
}

export function Tabs ({ type, stickyTop, ...props }: TabsProps) {
  const $type = type = type ?? 'line'

  if (type !== 'third' && stickyTop === undefined) {
    stickyTop = true // stickyTop is true by default for card and line
  }
  if (type === 'third') type = 'line'

  if (stickyTop) {
    props.onTabClick = props.onTabClick || function () {
      window.scrollTo(0, 0)
    }
  }

  return <UI.Tabs
    className={stickyTop ? 'sticky-top' : ''} // for PageHeader to count pageHeaderY
    {...props}
    type={type as AntTabsType}
    $type={$type}
    $stickyTop={stickyTop}
  />
}

Tabs.TabPane = AntTabs.TabPane
