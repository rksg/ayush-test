import { Tabs as AntTabs, TabsProps as AntTabsProps } from 'antd'
import { TabsType as AntTabsType }                    from 'antd/lib/tabs'

import * as UI from './styledComponents'

export type TabsType = 'third' | Exclude<AntTabsType, 'editable-card'>

export type TabsProps = Omit<AntTabsProps, 'type'> & {
  /** @default 'line' */
  type?: TabsType
}

export function Tabs ({ type, ...props }: TabsProps) {
  const $type = type = type ?? 'line'
  if (type === 'third') type = 'line'
  return <UI.Tabs {...props} type={type as AntTabsType} $type={$type} />
}

Tabs.TabPane = AntTabs.TabPane
