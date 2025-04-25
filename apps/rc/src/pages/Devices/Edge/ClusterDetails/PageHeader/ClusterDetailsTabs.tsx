/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const EdgeClusterDetailsTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/devices/edge/cluster/${params.clusterId}/details`)
  const navigate = useNavigate()

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
    </Tabs>
  )
}

export default EdgeClusterDetailsTabs