
import { Loader, Tabs }                                          from '@acx-ui/components'
import { useGetEdgePortsStatusListQuery, useGetPortConfigQuery } from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink }                 from '@acx-ui/react-router-dom'
import { getIntl }                                               from '@acx-ui/utils'

import PortsGeneral from './PortsGeneral'
import SubInterface from './SubInterface'

const { $t } = getIntl()

const Ports = () => {

  const navigate = useNavigate()
  const { activeSubTab, serialNumber, tenantId } = useParams()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edit/ports`)
  const { data: portDataResponse, isLoading: isPortDataLoading } = useGetPortConfigQuery({
    params: { serialNumber: serialNumber }
  })
  const portData = portDataResponse?.ports || []

  const portStatusPayload = {
    fields: ['port_id','ip'],
    filters: { serialNumber: [serialNumber] }
  }
  const { data: portStatusData, isLoading: isPortStatusLoading } = useGetEdgePortsStatusListQuery({
    params: { serialNumber: serialNumber, tenantId: tenantId }, payload: portStatusPayload
  })

  const statusIpMap = Object.fromEntries((portStatusData || [])
    .map(status => [status.portId, status.ip]))
  const portDataWithStatusIp = portData.map((item) => {
    return { ...item, statusIp: statusIpMap[item.id] }
  })

  const tabs = {
    'ports-general': {
      title: $t({ defaultMessage: 'Ports General' }),
      content: <PortsGeneral data={portDataWithStatusIp} />
    },
    'sub-interface': {
      title: $t({ defaultMessage: 'Sub-interface' }),
      content: <SubInterface data={portDataWithStatusIp} />
    }
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs
      onChange={onTabChange}
      defaultActiveKey='ports-general'
      activeKey={activeSubTab}
      type='card'
    >
      {Object.keys(tabs)
        .map((key) =>
          <Tabs.TabPane tab={tabs[key as keyof typeof tabs].title} key={key}>
            <Loader states={[{
              isLoading: (isPortDataLoading || isPortStatusLoading),
              isFetching: false }]}>
              {tabs[key as keyof typeof tabs].content}
            </Loader>
          </Tabs.TabPane>)}
    </Tabs>
  )
}

export default Ports