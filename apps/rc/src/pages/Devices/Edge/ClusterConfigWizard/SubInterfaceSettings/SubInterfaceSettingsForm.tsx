import { useEffect, useState } from 'react'

import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { NoData, Tabs, Tooltip } from '@acx-ui/components'
import {
  EdgePort,
  EdgePortInfo
} from '@acx-ui/rc/utils'

import { SubInterfaceTable } from './SubInterfaceTable'

const findPortIdByIfName = (portData: EdgePort[], ifName: string) => {
  return _.find(portData, { interfaceName: ifName })?.id ?? ''
}

export interface SubInterfaceSettingsFormProps {
  serialNumber: string
  ports: EdgePort[]
  portStatus: EdgePortInfo[]
  lagStatus: EdgePortInfo[]
}

export const SubInterfaceSettingsForm = (props: SubInterfaceSettingsFormProps) => {
  const { serialNumber, ports, portStatus, lagStatus } = props
  const { $t } = useIntl()
  const [currentTab, setCurrentTab] = useState('')

  const handleTabChange = (activeKey: string) => {
    setCurrentTab(activeKey)
  }

  const unLagPortIdx = portStatus.findIndex(item => !item.isLagMember) ?? -1

  useEffect(() => {
    if (unLagPortIdx > -1) {
      const portId = findPortIdByIfName(ports, portStatus[unLagPortIdx].portName)
      setCurrentTab(`port_${portId}`)
    } else {
      setCurrentTab(`lag_${lagStatus?.[0]?.id}`)
    }
  }, [unLagPortIdx])

  return ports?.length ?
    <Tabs
      type='third'
      activeKey={currentTab}
      onChange={handleTabChange}
    >
      {
        portStatus?.map((item) => {
          const portId = findPortIdByIfName(ports, item.portName)

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
              <Form.Item name={['portSubInterfaces', serialNumber, portId]}>
                <SubInterfaceTable
                  serialNumber={serialNumber}
                  currentTab={currentTab}
                  ip={item.ip!}
                  mac={item.mac}
                  allInterface={[
                    ...portStatus,
                    ...lagStatus
                  ]}
                  currentInterfaceName={item.portName}
                />
              </Form.Item>
            }
            disabled={item.isLagMember}
          />
        })
      }
      {
        lagStatus?.map(item =>
          <Tabs.TabPane
            tab={$t({ defaultMessage: 'LAG {id}' }, { id: item.id })}
            key={'lag_' + item.id}
            children={
              <Form.Item name={['lagSubInterfaces', serialNumber, item.id]}>
                <SubInterfaceTable
                  serialNumber={serialNumber}
                  currentTab={currentTab}
                  ip={item.ip ?? ''}
                  mac={item.mac ?? ''}
                  allInterface={[
                    ...portStatus,
                    ...lagStatus
                  ]}
                  currentInterfaceName={item.portName}
                />
              </Form.Item>
            }
          />
        )
      }
    </Tabs> :
    <NoData />
}
