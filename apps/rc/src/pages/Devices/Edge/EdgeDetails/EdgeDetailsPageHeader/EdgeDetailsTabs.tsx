/* eslint-disable max-len */
import { useIntl } from 'react-intl'

import { Tabs }                                  from '@acx-ui/components'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const EdgeDetailsTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const basePath = useTenantLink(`/devices/edge/${params.serialNumber}/edge-details`)
  const navigate = useNavigate()
  const onTabChange = (tab: string) => {
    if(tab === 'dhcp') tab = tab + '/pools'
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  // const { currentEdge } = props
  // const currentEdgeOperational = (currentEdge?.deviceStatus === EdgeStatusEnum.OPERATIONAL)

  return (
    <Tabs onChange={onTabChange} activeKey={params.activeTab}>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Overview' })} key='overview' />
      {/* { currentEdgeOperational &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Troubleshooting' })}
          key='troubleshooting' />} */}
      <Tabs.TabPane
        tab={$t({ defaultMessage: 'Services ({servicesCount})' }, { servicesCount: 0 })} // TODO: API support
        key='services'
      />
      <Tabs.TabPane tab={$t({ defaultMessage: 'DHCP' })} key='dhcp' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Timeline' })} key='timeline' />
    </Tabs>
  )
}

export default EdgeDetailsTabs