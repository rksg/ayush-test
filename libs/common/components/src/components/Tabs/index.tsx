import { Tabs as AntTabs, TabsProps as AntTabsProps, TabPaneProps as AntTabPaneProps } from 'antd'
import { TabsType as AntTabsType }                                                     from 'antd/lib/tabs'
import _                                                                               from 'lodash'
import TabNavList                                                                      from 'rc-tabs/lib/TabNavList'

import { getTitleWithIndicator }     from '../BetaIndicator'
import { useLayoutTrackStickyNodes } from '../Layout'

import * as UI from './styledComponents'

export type TabsType = 'third' | Exclude<AntTabsType, 'editable-card'>

export type TabsProps = Omit<AntTabsProps, 'type'> & {
  /** @default 'line' */
  type?: TabsType
  /** @default 'true' */
  stickyTop?: boolean
}

export type TabPaneProps = {
  isBetaFeature?: boolean
} & AntTabPaneProps

export function Tabs ({ type, stickyTop, ...props }: TabsProps) {
  const $type = type = type ?? 'line'
  const { ref, rect } = useLayoutTrackStickyNodes()

  if (type !== 'third' && stickyTop === undefined) {
    stickyTop = true // stickyTop is true by default for card and line
  }
  if (type === 'third') type = 'line'

  if (stickyTop) {
    props.onTabClick = props.onTabClick || function () {
      window.scrollTo(0, 0)
    }
  }

  const checkTabIndicator = (tab: React.ReactElement) => ({
    ...tab,
    props: {
      ...tab?.props,
      tab: tab?.props?.isBetaFeature
        ? getTitleWithIndicator(tab?.props?.tab) : tab?.props?.tab
    }
  })

  const transformedProps = {
    ...props,
    ...( props?.children ? {
      /**
       * case1: [TabPane1, TabPane2, TabPane3]
       * case2: [TabPane1, [TabPane2, TabPane3]]
       * case3: {TabPane1} // only one TabPane
       */
      children: _.isArray(props?.children)
        ? props.children.flat().filter(c => _.isObject(c) && Object.keys(c)).map(checkTabIndicator)
        : _.isObject(props?.children)
          ? checkTabIndicator(props.children as React.ReactElement)
          : undefined
    } : {})
  }
  const renderTabBar = (
    (props, TabBar: typeof TabNavList) => <TabBar {...props} ref={ref} />
  ) as AntTabsProps['renderTabBar']

  return <UI.Tabs
    renderTabBar={renderTabBar}
    {...transformedProps}
    type={type as AntTabsType}
    $type={$type}
    $stickyTop={stickyTop ? rect()?.top : undefined}
  />
}

Tabs.TabPane = (props: TabPaneProps) => <AntTabs.TabPane {...props} />
