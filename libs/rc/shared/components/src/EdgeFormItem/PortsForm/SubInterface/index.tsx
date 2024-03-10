import { useContext, useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { NoData, Tabs, Tooltip }   from '@acx-ui/components'
import { EdgeLagStatus, EdgePort } from '@acx-ui/rc/utils'

import { EdgePortsDataContext } from '../PortDataProvider'

import { LagSubInterfaceTable }  from './LagSubInterfaceTable'
import { PortSubInterfaceTable } from './PortSubInterfaceTable'

interface SubInterfaceProps {
  serialNumber: string
  portData: EdgePort[]
  lagData?: EdgeLagStatus[]
}

const SubInterface = (props: SubInterfaceProps) => {
  const { serialNumber, portData, lagData } = props
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState('')
  const { portStatus } = useContext(EdgePortsDataContext)

  const handleTabChange = (activeKey: string) => {
    setCurrentTab(activeKey)
  }

  useEffect(() => {
    const unLagPortIdx = portStatus.findIndex(item => !item.isLagMember) ?? -1
    setCurrentTab(
      unLagPortIdx > -1 ?
        `port_${portData[unLagPortIdx].id}` :
        `lag_${lagData?.[0].lagId}`
    )
  }, [portData, lagData])

  return (
    portData.length > 0 ?
      <Tabs
        type='third'
        activeKey={currentTab}
        onChange={handleTabChange}
      >
        {
          portStatus.map((item) =>
            <Tabs.TabPane
              tab={
                item.isLagMember
                  ? <Tooltip title={$t({ defaultMessage: `This port is a LAG member 
                    and is not available for adding sub-interfaces.` })}>
                    {_.capitalize(item.portName)}
                  </Tooltip>
                  : _.capitalize(item.portName)
              }
              key={'port_' + item.portName}
              children={
                <PortSubInterfaceTable
                  serialNumber={serialNumber}
                  currentTab={currentTab}
                  ip={item.ip!}
                  mac={item.mac}
                  portId={item.portName}
                />
              }
              disabled={item.isLagMember}
            />
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
