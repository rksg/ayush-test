import { useIntl } from 'react-intl'

import { getUserProfile, RolesEnum }             from '@acx-ui/analytics/utils'
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
  const { selectedTenant: { role } } = getUserProfile()
  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      {
        role !== RolesEnum.BUSSINESS_INSIGHTS_USER
          ? <Tabs.TabPane
            tab={$t({ defaultMessage: 'Troubleshooting' })}
            key='troubleshooting'
          />
          : <></>
      }
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Reports' })}
        key='reports'
      />
    </Tabs>
  )
}

export default ClientDetailTabs
