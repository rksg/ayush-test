/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Tabs, Tooltip }                         from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import { ApDetailHeader, ApDeviceStatusEnum }    from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { notAvailableMsg }                       from '@acx-ui/utils'

function ApTabs (props:{ apDetail: ApDetailHeader }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/devices/wifi/${params.serialNumber}/details/`)
  const navigate = useNavigate()
  const releaseTag = useIsSplitOn(Features.DEVICES)
  const onTabChange = (tab: string) => {
    if (tab === 'troubleshooting') tab = `${tab}/ping`
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  const { apDetail } = props
  const currentApOperational = (apDetail?.headers?.overview === ApDeviceStatusEnum.OPERATIONAL)

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'AI Analytics' })} key='analytics' />
      {currentApOperational &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })}
          key='troubleshooting' />}
      <Tabs.TabPane
        disabled={!releaseTag}
        tab={<Tooltip title={$t(notAvailableMsg)}>{$t({ defaultMessage: 'Reports' })}</Tooltip>}
        key='reports'
      />
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Networks ({networksCount})' }, { networksCount: apDetail?.headers?.networks })}
        key='networks'
      />
      <Tabs.TabPane
        disabled={!releaseTag}
        tab={<Tooltip title={$t(notAvailableMsg)}>
          {$t({ defaultMessage: 'Clients ({clientsCount})' }, { clientsCount: apDetail?.headers?.clients })}
        </Tooltip>}
        key='clients'
      />
      <Tabs.TabPane
        disabled={!releaseTag}
        tab={<Tooltip title={$t(notAvailableMsg)}>
          {$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount: apDetail?.headers?.services || 0 })}
          {/* TODO: API support */}
        </Tooltip>}
        key='services'
      />
      <Tabs.TabPane
        disabled={!releaseTag}
        tab={<Tooltip title={$t(notAvailableMsg)}>{$t({ defaultMessage: 'Timeline' })} </Tooltip>}
        key='timeline'
      />
    </Tabs>
  )
}

export default ApTabs
