import { useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { NoData, Tabs, Tooltip }             from '@acx-ui/components'
import { EdgeLagStatus, EdgePortWithStatus } from '@acx-ui/rc/utils'


import { LagSubInterfaceTable }  from './LagSubInterfaceTable'
import { PortSubInterfaceTable } from './PortSubInterfaceTable'

interface SubInterfaceProps {
  portData: EdgePortWithStatus[]
  lagData?: EdgeLagStatus[]
}

const SubInterface = (props: SubInterfaceProps) => {
  const { portData, lagData } = props
  const { serialNumber = '' } = useParams()
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState('')

  const handleTabChange = (activeKey: string) => {
    setCurrentTab(activeKey)
  }

  useEffect(() => {
    const unLagPortIdx = portData?.findIndex(item => !item.isLagPort)
    setCurrentTab(
      unLagPortIdx > -1 ?
        `port_${unLagPortIdx + 1}` :
        `lag_${lagData?.[0].lagId}`
    )
  }, [portData])

  return (
    portData.length > 0 ?
      <Tabs type='third' activeKey={currentTab} onChange={handleTabChange}>
        {
          portData.map((item, index) =>
            <Tabs.TabPane
              tab={
                item.isLagPort ?
                  <Tooltip title={$t({ defaultMessage: `This port is a LAG member 
                    and is not available for adding sub-interfaces.` })}>
                    {$t({ defaultMessage: 'Port {index}' }, { index: index + 1 })}
                  </Tooltip> :
                  $t({ defaultMessage: 'Port {index}' }, { index: index + 1 })
              }
              key={'port_' + (index + 1)}
              children={
                <PortSubInterfaceTable
                  serialNumber={serialNumber}
                  currentTab={currentTab}
                  ip={item.statusIp}
                  mac={item.mac}
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
                  ip={item.ip}
                  mac={item.mac}
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
