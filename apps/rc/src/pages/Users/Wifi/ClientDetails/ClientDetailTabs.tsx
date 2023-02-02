import { useIntl } from 'react-intl'

import { Tooltip, Tabs }                         from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { notAvailableMsg }                       from '@acx-ui/utils'

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
  const enableClientTroubleShooting = useIsSplitOn(Features.CLIENT_TROUBLESHOOTING)

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Overview' })}
        key='overview'
      />
      {enableClientTroubleShooting ?
        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Troubleshooting' })}
          key='troubleshooting'
        />:
        <Tabs.TabPane
          disabled
          tab={<Tooltip title={$t(notAvailableMsg)}>
            {$t({ defaultMessage: 'Troubleshooting' })}
          </Tooltip>}
          key='troubleshooting'
        />
      }
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Reports' })}
        key='reports'
      />
      <Tabs.TabPane
        disabled={!useIsSplitOn(Features.UNRELEASED)}
        tab={<Tooltip title={useIsSplitOn(Features.UNRELEASED) ? '' :
          $t(notAvailableMsg)}>
          {$t({ defaultMessage: 'Timeline' })}
        </Tooltip>}
        key='timeline'
      />
    </Tabs>
  )
}

export default ClientDetailTabs
