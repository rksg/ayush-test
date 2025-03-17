import { useState } from 'react'

import { Tabs }                               from '@acx-ui/components'
import { ScopePermission, ScopeTreeDataNode } from '@acx-ui/rc/utils'

import { PermissionsTab } from './PermissionsTab'

interface AdvancedPermissionsTabProps {
  updateSelected?: (key: string, permission: string, enabled: boolean) => void
  scopes: ScopeTreeDataNode[]
  permissions: ScopePermission[]
}

export const AdvancedPermissionsTab = (props: AdvancedPermissionsTabProps) => {
  const { updateSelected, scopes, permissions } = props
  const [currentTab, setCurrentTab] = useState(scopes.at(0)?.title?.toString())

  const tabs = scopes.map(scope => {
    return {
      key: scope.title?.toString(),
      title: scope.title?.toString(),
      component: <PermissionsTab
        updateSelected={updateSelected}
        scopeHierarchy={scopes}
        tabScopes={scope.children ?? []}
        permissions={permissions}
      />
    }
  })

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const ActiveTabPane = tabs.find(({ key }) => key === currentTab)?.component

  const tabContent = <>
    <Tabs
      defaultActiveKey={scopes.at(0)?.key.toString()}
      type='card'
      activeKey={currentTab}
      onChange={onTabChange}
    >
      {tabs.map(({ key, title }) =>
        <Tabs.TabPane tab={title} key={key} />)}
    </Tabs>
    {ActiveTabPane}
  </>
  return <div>
    {tabContent}
  </div>
}
