import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function SwitchTabs () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/devices/switch/${params.switchId}/${params.serial}/details/`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Incidents' })} key='incidents' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Reports' })} key='reports' />
    </Tabs>
  )
}

export default SwitchTabs
