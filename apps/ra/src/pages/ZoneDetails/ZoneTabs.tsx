import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function VenueTabs () {
  const { $t } = useIntl()
  const { systemName, zoneName, activeTab } = useParams()
  const basePath = useTenantLink(`/zones/${systemName}/${zoneName}/`)
  const navigate = useNavigate()

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab} defaultActiveKey='assurance'>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'AI Analytics' })}
        key='assurance'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients (Top 100 by traffic)' })}
        key='clients'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Devices' })}
        key='devices'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks' })}
        key='networks'
      />
    </Tabs>
  )
}

export default VenueTabs

