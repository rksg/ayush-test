import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchConfigHistoryTable }              from '@acx-ui/switch/components'

import { SwitchDetailsContext } from '..'

import { SwitchConfigBackupTable } from './SwitchConfigBackupTable'

export function SwitchConfigurationTab () {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink(
    `/devices/switch/${params.switchId}/${params.serialNumber}/details/configuration/`
  )
  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const { switchDetailHeader: switchDetail } = switchDetailsContextData

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
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Restore & Backup' })} key='backup'>
        {switchDetail && <SwitchConfigBackupTable switchDetail={switchDetail} />}
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'History' })} key='history'>
        {switchDetail && <SwitchConfigHistoryTable switchDetail={switchDetail} />}
      </Tabs.TabPane>
    </Tabs>
  )
}
