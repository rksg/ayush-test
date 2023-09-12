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

export function Tabs ({ type, stickyTop = true, ...props }: TabsProps) {
  let $type: UI.styleTabsType = type ?? 'line'
  if (type === 'card' && stickyTop) $type = 'second'
  if (type === 'third') type = 'line'

  if (stickyTop) {
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
