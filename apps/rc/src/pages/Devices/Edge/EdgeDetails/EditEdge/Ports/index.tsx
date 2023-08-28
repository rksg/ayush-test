import { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Tabs }                                          from '@acx-ui/components'
import { useGetEdgePortsStatusListQuery, useGetPortConfigQuery } from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink }                 from '@acx-ui/react-router-dom'

import { EdgeEditContext } from '..'

import PortsGeneral from './PortsGeneral'
import SubInterface from './SubInterface'

const Ports = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, serialNumber, tenantId } = useParams()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edit/ports`)
  const { data: portDataResponse, isLoading: isPortDataLoading } = useGetPortConfigQuery({
    params: { serialNumber: serialNumber }
  })
  const {
    activeSubTab: activeSubTabInContext,
    setActiveSubTab: setActiveSubTabInContext,
    formControl
  } = useContext(EdgeEditContext)
  const { isDirty } = formControl

  useEffect(() => {
    setActiveSubTabInContext({
      key: activeSubTab as string,
      title: tabs[activeSubTab as keyof typeof tabs].title
    })
  }, [])

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
      title: $t({ defaultMessage: 'Sub-Interface' }),
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
      type='second'
    >
      {Object.keys(tabs)
        .map((key) =>
          <Tabs.TabPane
            tab={`${tabs[key as keyof typeof tabs].title}
              ${(activeSubTabInContext.key === key && isDirty) ? '*' : ''}`}
            key={key}
          >
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
