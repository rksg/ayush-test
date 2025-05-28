import { useContext, useEffect, useState } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import { Loader, NoData, Tabs, Tooltip } from '@acx-ui/components'
import { Features }                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }         from '@acx-ui/rc/components'
import { EdgePort }                      from '@acx-ui/rc/utils'

import { ClusterNavigateWarning } from '../ClusterNavigateWarning'
import { EditEdgeDataContext }    from '../EditEdgeDataProvider'

import { LagSubInterfaceTable }  from './LagSubInterfaceTable'
import { PortSubInterfaceTable } from './PortSubInterfaceTable'

// ifName: interface name
const findPortIdByIfName = (portData: EdgePort[], ifName: string) => {
  return _.find(portData, { interfaceName: ifName })?.id ?? ''
}

export const SubInterfaces = () => {
  const isEdgeDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const { serialNumber = '' } = useParams()
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState('')
  const {
    portData,
    portStatus,
    lagStatus,
    isPortDataFetching,
    isPortStatusFetching,
    isLagStatusFetching,
    isClusterFormed,
    isSupportAccessPort
  } = useContext(EditEdgeDataContext)

  const handleTabChange = (activeKey: string) => {
    setCurrentTab(activeKey)
  }

  useEffect(() => {
    const unLagPortIdx = portStatus.findIndex(item => !item.isLagMember) ?? -1
    if (unLagPortIdx > -1) {
      const portId = findPortIdByIfName(portData, portStatus[unLagPortIdx].portName)
      setCurrentTab(`port_${portId}`)
    } else {
      setCurrentTab(`lag_${lagStatus?.[0]?.lagId}`)
    }
  }, [portData, portStatus, lagStatus])

  const disabledWholeForm = isClusterFormed || isEdgeDualWanEnabled

  return (
    <Loader states={[{
      isLoading: false,
      isFetching: isPortDataFetching || isPortStatusFetching || isLagStatusFetching
    }]}>
      {
        disabledWholeForm &&
          <ClusterNavigateWarning
            warningMsgDescriptor={isClusterFormed
              ? undefined
              : defineMessage({
                defaultMessage: `Please go to “{redirectLink}” to modify the configurations
                    for all nodes in this cluster ({clusterName})` })
            }
          />
      }
      <Form disabled={disabledWholeForm}>
        {
          portData.length > 0 ?
            <Tabs
              type='third'
              activeKey={currentTab}
              onChange={handleTabChange}
            >
              {
                portStatus.map((item) => {
                  const portId = findPortIdByIfName(portData, item.portName)

                  return <Tabs.TabPane
                    tab={
                      item.isLagMember
                        ? <Tooltip title={$t({ defaultMessage: `This port is a LAG member 
                      and is not available for adding sub-interfaces.` })}>
                          {_.capitalize(item.portName)}
                        </Tooltip>
                        : _.capitalize(item.portName)
                    }
                    key={`port_${portId}`}
                    children={
                      <PortSubInterfaceTable
                        serialNumber={serialNumber}
                        currentTab={currentTab}
                        ip={item.ip!}
                        mac={item.mac}
                        portId={portId}
                        isSupportAccessPort={isSupportAccessPort}
                      />
                    }
                    disabled={item.isLagMember}
                  />
                }
                )
              }
              {
                lagStatus?.map(item =>
                  <Tabs.TabPane
                    tab={$t({ defaultMessage: 'LAG {id}' }, { id: item.lagId })}
                    key={'lag_' + item.lagId}
                    children={
                      <LagSubInterfaceTable
                        serialNumber={serialNumber}
                        currentTab={currentTab}
                        ip={item.ip ?? ''}
                        mac={item.mac ?? ''}
                        lagId={item.lagId}
                        isSupportAccessPort={isSupportAccessPort}
                      />
                    }
                  />
                )
              }
            </Tabs>
            : <NoData />
        }
      </Form>
    </Loader>
  )
}

export default SubInterfaces