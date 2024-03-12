import { useContext, useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { NoData, Tabs, Tooltip }   from '@acx-ui/components'
import { EdgeLagStatus, EdgePort } from '@acx-ui/rc/utils'

import { EdgePortsDataContext } from '../PortDataProvider'

import { LagSubInterfaceTable }  from './LagSubInterfaceTable'
import { PortSubInterfaceTable } from './PortSubInterfaceTable'

// ifName: interface name
const findPortIdByIfName = (portData: EdgePort[], ifName: string) => {
  return _.find(portData, { interfaceName: ifName })?.id ?? ''
}
interface SubInterfaceProps {
  serialNumber: string
  lagData?: EdgeLagStatus[]
}

const SubInterface = (props: SubInterfaceProps) => {
  const { serialNumber, lagData } = props
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState('')
  const { portData, portStatus } = useContext(EdgePortsDataContext)

  const handleTabChange = (activeKey: string) => {
    setCurrentTab(activeKey)
  }

  useEffect(() => {
    const unLagPortIdx = portStatus.findIndex(item => !item.isLagMember) ?? -1
    if (unLagPortIdx > -1) {
      const portId = findPortIdByIfName(portData, portStatus[unLagPortIdx].portName)
      setCurrentTab(`port_${portId}`)
    } else {
      setCurrentTab(`lag_${lagData?.[0].lagId}`)
    }
  }, [portData, portStatus, lagData])

  return (
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
                />
              }
              disabled={item.isLagMember}
            />
          }
          )
        }
        {
          lagData?.map(item =>
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
                />
              }
            />
          )
        }
      </Tabs>
      : <NoData />
  )
}

export default SubInterface
