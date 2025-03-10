import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Button, Loader, NoData, Tabs }                                        from '@acx-ui/components'
import { Features, useIsSplitOn }                                              from '@acx-ui/feature-toggle'
import { EdgeLagStatus, EdgePortStatus, getEdgePortDisplayName, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                               from '@acx-ui/react-router-dom'
import { EdgeScopes }                                                          from '@acx-ui/types'
import { hasPermission }                                                       from '@acx-ui/user'
import { getOpsApi }                                                           from '@acx-ui/utils'

import { EdgeSubInterfacesTable } from './EdgeSubInterfacesTable'
import { LagSubInterfaceTable }   from './LagSubInterfaceTable'

interface EdgeSubInterfacesTabProps {
  isConfigurable: boolean
  ports: EdgePortStatus[]
  lags: EdgeLagStatus[]
  isLoading: boolean
}

export const EdgeSubInterfacesTab = (props: EdgeSubInterfacesTabProps) => {

  const { ports, lags, isLoading, isConfigurable } = props
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const isEdgeLagEnabled = useIsSplitOn(Features.EDGE_LAG)
  const navigate = useNavigate()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}`)

  let tabs: { title: string, id: string, ifName?: string, lagId?: number }[]

  if(isEdgeLagEnabled) {
    const normalPorts = ports.filter(port =>
      !lags.some(lag =>
        lag.lagMembers?.some(lagMember =>
          lagMember.portId === port.portId)))
      .map(item => ({
        title: getEdgePortDisplayName(item),
        id: item.portId,
        ifName: item.interfaceName
      }))
    tabs = [
      ...normalPorts,
      ...lags.map(item => ({
        title: item.name,
        id: item.lagId.toString(),
        ifName: item?.name ?? '',
        lagId: item.lagId
      }))
    ]
  } else {
    tabs = ports.map(item => ({
      title: getEdgePortDisplayName(item),
      id: item.portId,
      ifName: item.interfaceName
    }))
  }



  const handleClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/sub-interfaces`
    })
  }

  const hasUpdatePermission = hasPermission({
    scopes: [EdgeScopes.UPDATE],
    rbacOpsIds: [
      getOpsApi(EdgeUrlsInfo.addSubInterfaces),
      getOpsApi(EdgeUrlsInfo.updateSubInterfaces),
      getOpsApi(EdgeUrlsInfo.deleteSubInterfaces),
      getOpsApi(EdgeUrlsInfo.importSubInterfacesCSV)
    ]
  })

  return <Row justify='end'>
    {hasUpdatePermission && isConfigurable &&
      <Button
        size='small'
        type='link'
        onClick={handleClick}
      >
        {$t({ defaultMessage: 'Configure Sub-interface Settings' })}
      </Button>
    }

    <Col span={24}>
      <Loader states={[{ isLoading }]} style={{ minHeight: '80px' }}>
        {serialNumber && ports.length > 0
          ? <Tabs type='third'>
            {tabs?.map((item) => {
              // subinterfaces mac === physical port mac
              return <Tabs.TabPane
                tab={item.title}
                key={item.id}
              >
                {
                  item.lagId === undefined ?
                    <EdgeSubInterfacesTable serialNumber={serialNumber} ifName={item.ifName} /> :
                    <LagSubInterfaceTable serialNumber={serialNumber} lagId={item.lagId} />
                }
              </Tabs.TabPane>
            })}
          </Tabs>
          : <NoData />
        }
      </Loader>
    </Col>
  </Row>
}