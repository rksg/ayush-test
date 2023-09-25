/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { SwitchViewModel, isOperationalSwitch }  from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { hasAccess }                             from '@acx-ui/user'

function SwitchTabs (props:{ switchDetail: SwitchViewModel }) {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/devices/switch/${params.switchId}/${params.serialNumber}/details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  const { switchDetail } = props
  const isOperational = switchDetail?.deviceStatus ?
    isOperationalSwitch(switchDetail?.deviceStatus, switchDetail.syncedSwitchConfig) : false

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      { hasAccess() && <Tabs.TabPane tab={$t({ defaultMessage: 'Incidents' })} key='incidents' /> }
      {isOperational &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })} key='troubleshooting' />}
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Clients ({clientsCount})' }, { clientsCount: switchDetail?.clientCount || 0 })}
        key='clients'
      />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Configuration' })} key='configuration' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'DHCP' })} key='dhcp' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default SwitchTabs
