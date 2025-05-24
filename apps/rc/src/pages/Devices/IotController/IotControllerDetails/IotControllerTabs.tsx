import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { IotControllerSetting }                  from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

function IotControllerTabs (props:{ iotControllerSetting: IotControllerSetting }) {
  const { $t } = useIntl()
  const params = useParams()
  const { iotControllerSetting } = props
  const basePath = useTenantLink(`/devices/iotController/
    ${iotControllerSetting?.id}/details`)
  const navigate = useNavigate()

  const onTabChange = (tab: string) =>
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
    </Tabs>
  )
}

export default IotControllerTabs
