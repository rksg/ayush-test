import { Tabs } from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { useIntl } from 'react-intl'
import { SwitchConfigBackup } from './SwitchConfigBackup'
import { SwitchConfigHistory } from './SwitchConfigHistory'

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
      type='card'
      style={{ marginTop: '25px' }}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Restore & Backup' })} key='backup'>
        <SwitchConfigBackup />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'History' })} key='history'>
        <SwitchConfigHistory />
      </Tabs.TabPane>
    </Tabs>
  )
}