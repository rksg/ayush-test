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
        tab={$t({ defaultMessage: 'Troubleshooting' })}
        key='troubleshooting'
      />
      <Tabs.TabPane
        disabled
        tab={$t({ defaultMessage: 'Reports' })}
        key='reports'
      />
    </Tabs>
  )
}

export default ClientDetailTabs
