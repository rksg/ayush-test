import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }                   from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ClientDualTable }        from '@acx-ui/rc/components'
import { useTenantLink }          from '@acx-ui/react-router-dom'
import { ApWiredClientTable }     from '@acx-ui/wifi/components'

export function ApClientsTab () {
  const { $t } = useIntl()
  const isSupportWifiWiredClient = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)
  const navigate = useNavigate()
  const { apId, activeSubTab } = useParams()
  const basePath = useTenantLink(`devices/wifi/${apId}/details/clients`)

  const tabs = !isSupportWifiWiredClient? [] : [
    {
      label: $t({ defaultMessage: 'Wireless' }),
      value: 'wireless',
      children: <ClientDualTable />
    },
    {
      label: $t({ defaultMessage: 'Wired' }),
      value: 'wired',
      children: <ApWiredClientTable searchable={true} />
    }]

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (isSupportWifiWiredClient?
    <Tabs activeKey={activeSubTab}
      defaultActiveKey={activeSubTab || tabs[0]?.value}
      onChange={onTabChange}
      type='card'
      destroyInactiveTabPane
    >
      {tabs.map((tab) => (
        <Tabs.TabPane
          tab={tab.label}
          key={tab.value}
        >
          {tab.children}
        </Tabs.TabPane>
      ))}
    </Tabs>
    :
    <ClientDualTable />
  )
}
