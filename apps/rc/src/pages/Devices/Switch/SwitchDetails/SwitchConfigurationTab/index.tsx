import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { SwitchConfigHistoryTable }              from '@acx-ui/rc/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { SwitchConfigBackupTable } from './SwitchConfigBackupTable'

export function SwitchConfigurationTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(
    `/devices/switch/${params.switchId}/${params.serialNumber}/details/configuration/`
  )

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  return (
    <Tabs onChange={onTabChange}
      activeKey={params.activeSubTab}
      type='second'
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Restore & Backup' })} key='backup'>
        <SwitchConfigBackupTable />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'History' })} key='history'>
        <SwitchConfigHistoryTable />
      </Tabs.TabPane>
    </Tabs>
  )
}
