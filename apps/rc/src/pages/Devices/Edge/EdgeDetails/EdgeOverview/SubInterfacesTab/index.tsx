import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { Button, Loader, NoData, Tabs }                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { EdgeLagStatus, EdgePortStatus, getEdgePortDisplayName } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                 from '@acx-ui/react-router-dom'
import { hasAccess }                                             from '@acx-ui/user'

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

  let tabs: { title: string, id: string, mac: string, lagId?: number }[]

  if(isEdgeLagEnabled) {
    const normalPorts = ports.filter(port =>
      !lags.some(lag =>
        lag.lagMembers?.some(lagMember =>
          lagMember.portId === port.portId)))
      .map(item => ({
        title: getEdgePortDisplayName(item),
        id: item.portId,
        mac: item.mac
      }))
    tabs = [
      ...normalPorts,
      ...lags.map(item => ({
        title: item.name,
        id: item.lagId.toString(),
        mac: item?.mac ?? '',
        lagId: item.lagId
      }))
    ]
  } else {
    tabs = ports.map(item => ({
      title: getEdgePortDisplayName(item),
      id: item.portId,
      mac: item.mac
    }))
  }



  const handleClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/edit/ports/sub-interface`
    })
  }

  return <Row justify='end'>
    {hasAccess() && isConfigurable &&
      <Button
        size='small'
        type='link'
        onClick={handleClick}
      >
        {$t({ defaultMessage: 'Configure Sub-interface Settings' })}
      </Button>
    }

    <Col span={24}>
      <Loader states={[{ isLoading }]}>
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
                    <EdgeSubInterfacesTable serialNumber={serialNumber} portMac={item.mac} /> :
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