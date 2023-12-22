import { ReactNode, useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Tabs }                                                                         from '@acx-ui/components'
import { Features, useIsSplitOn }                                                               from '@acx-ui/feature-toggle'
import { useGetEdgeLagsStatusListQuery, useGetEdgePortsStatusListQuery, useGetPortConfigQuery } from '@acx-ui/rc/services'
import { useNavigate, useParams, useTenantLink }                                                from '@acx-ui/react-router-dom'

import { EdgeEditContext } from '..'

import Lag          from './Lag'
import PortsGeneral from './PortsGeneral'
import SubInterface from './SubInterface'

const Ports = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { activeSubTab, serialNumber, tenantId } = useParams()
  const isEdgeLagEnabled = useIsSplitOn(Features.EDGE_LAG)
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

  const { data: lagData, isLoading: isLagLoading } = useGetEdgeLagsStatusListQuery({
    params: { serialNumber },
    payload: {
      sortField: 'lagId',
      sortOrder: 'ASC'
    }
  }, {
    skip: !isEdgeLagEnabled
  })

  const statusIpMap = Object.fromEntries((portStatusData || [])
    .map(status => [status.portId, status.ip]))
  const portDataWithStatusIp = portData.map((item) => {
    const isLagPort = lagData?.data?.some(lag =>
      lag.lagMembers?.some(lagMember =>
        lagMember.portId === item.id)) ?? false
    return { ...item, statusIp: statusIpMap[item.id ?? ''], isLagPort }
  })

  const tabs = {
    'ports-general': {
      title: $t({ defaultMessage: 'Ports General' }),
      content: <PortsGeneral data={portDataWithStatusIp} />
    },
    ...(
      isEdgeLagEnabled ?
        {
          lag: {
            title: $t({ defaultMessage: 'LAG' }),
            content: <Lag
              lagStatusList={lagData?.data || []}
              isLoading={isLagLoading}
              portList={portData}
            />
          }
        } : {} as { title: string, content: ReactNode }
    ),
    'sub-interface': {
      title: $t({ defaultMessage: 'Sub-Interface' }),
      content: <SubInterface
        portData={portDataWithStatusIp}
        lagData={lagData?.data || []}
      />
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
          <Tabs.TabPane
            tab={`${tabs[key as keyof typeof tabs].title}
              ${(activeSubTabInContext.key === key && isDirty) ? '*' : ''}`}
            key={key}
          >
            <Loader states={[{
              isLoading: (isPortDataLoading || isPortStatusLoading || isLagLoading),
              isFetching: false }]}>
              {tabs[key as keyof typeof tabs].content}
            </Loader>
          </Tabs.TabPane>)}
    </Tabs>
  )
}

export default Ports
