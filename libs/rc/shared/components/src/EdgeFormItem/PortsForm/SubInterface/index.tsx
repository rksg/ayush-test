import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { NoData, Tabs, Tooltip }                                     from '@acx-ui/components'
import { EdgeLagStatus, EdgePortWithStatus, getEdgePortDisplayName } from '@acx-ui/rc/utils'

import { EdgePortsDataContext } from '../PortDataProvider'

import { LagSubInterfaceTable }  from './LagSubInterfaceTable'
import { PortSubInterfaceTable } from './PortSubInterfaceTable'

interface SubInterfaceProps {
  serialNumber: string
  lagData?: EdgeLagStatus[]
}

const SubInterface = (props: SubInterfaceProps) => {
  const { serialNumber/*, portData*/, lagData } = props
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState('')
  const portsData = useContext(EdgePortsDataContext)
  const portData = portsData.portData as EdgePortWithStatus[]

  const handleTabChange = (activeKey: string) => {
    setCurrentTab(activeKey)
  }

  useEffect(() => {
    const unLagPortIdx = portData.findIndex(item => !item.isLagPort)
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
          portData.map((item) =>
            <Tabs.TabPane
              tab={
                item.isLagPort
                  ? <Tooltip title={$t({ defaultMessage: `This port is a LAG member 
                    and is not available for adding sub-interfaces.` })}>
                    {getEdgePortDisplayName(item)}
                  </Tooltip>
                  : getEdgePortDisplayName(item)
              }
              key={'port_' + item.id}
              children={
                <PortSubInterfaceTable
                  serialNumber={serialNumber}
                  currentTab={currentTab}
                  ip={item.statusIp}
                  mac={item.mac}
                  portId={item.id}
                />
              }
              disabled={item.isLagPort}
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
