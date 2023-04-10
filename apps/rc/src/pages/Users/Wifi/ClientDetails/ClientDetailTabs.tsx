import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function ClientDetailTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/users/wifi/clients/${params.clientId}/details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Overview' })}
        key='overview'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Troubleshooting' })}
        key='troubleshooting'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Reports' })}
        key='reports'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Timeline' })}
        key='timeline'
      />
    </Tabs>
  )
}

export default ClientDetailTabs
