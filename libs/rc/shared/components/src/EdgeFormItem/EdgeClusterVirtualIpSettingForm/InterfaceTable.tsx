import { useEffect, useState } from 'react'

import { Divider } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Table }                                                  from '@acx-ui/components'
import { EdgeIpModeEnum, EdgeStatus, VirtualIpSetting, getIpWithBitMask } from '@acx-ui/rc/utils'

import { SelectInterfaceDrawer } from './SelectInterfaceDrawer'

import { VipInterface, VirtualIpFormType } from '.'

interface InterfaceTableProps {
  value?: VirtualIpSetting['ports']
  onChange?: (data: unknown) => void
  index?: number
  nodeList?: EdgeStatus[]
  lanInterfaces?: {
    [key: string]: VipInterface[]
  }
  selectedInterfaces?: VirtualIpFormType['vipConfig']
  onClear?: () => void
}

interface InterfaceTableDataType {
  nodeName: string
  interface: string
  ip: string
}

export const InterfaceTable = (props: InterfaceTableProps) => {
  const {
    value, onChange, index = 0, nodeList,
    lanInterfaces, selectedInterfaces,
    onClear
  } = props
  const { $t } = useIntl()
  const [selectInterfaceDrawerVisible, setSelectInterfaceDrawerVisible] = useState(false)
  const [data, setData] = useState<InterfaceTableDataType[]>([])

  useEffect(() => {
    if(!nodeList || !lanInterfaces || !value) return
    setData(nodeList.map(node => {
      const target = value.find(item => item.serialNumber === node.serialNumber)
      const targetInterfaceInfo = lanInterfaces[node.serialNumber].find(item =>
        item.interfaceName.toLowerCase() === target?.portName.toLowerCase())
      return {
        nodeName: node.name,
        interface: _.capitalize(target?.portName),
        ip: targetInterfaceInfo?.ipMode === EdgeIpModeEnum.DHCP ?
          $t({ defaultMessage: 'Dynamic' }) :
          getIpWithBitMask(targetInterfaceInfo?.ip, targetInterfaceInfo?.subnet)
      }
    }))
  }, [nodeList, lanInterfaces, value])

  const handleSelectPort = (data: VirtualIpSetting['ports']) => {
    onChange?.(data)
  }

  const clearData = () => {
    onChange?.(undefined)
    onClear?.()
  }

  const columns = [
    {
      title: $t({ defaultMessage: 'Node Name' }),
      key: 'nodeName',
      dataIndex: 'nodeName'
    },
    {
      title: $t({ defaultMessage: 'Interface' }),
      key: 'interface',
      dataIndex: 'interface'
    },
    {
      title: $t({ defaultMessage: 'IP Subnet' }),
      key: 'ip',
      dataIndex: 'ip'
    }
  ]

  return (
    <>
      {
        (value && Object.values(value).length > 0) ?
          <>
            <div style={{ textAlign: 'end' }}>
              <Button
                type='link'
                onClick={() => setSelectInterfaceDrawerVisible(true)}
                children={
                  $t({ defaultMessage: 'Change' })
                }
              />
              <Divider type='vertical' />
              <Button
                type='link'
                children={$t({ defaultMessage: 'Clear' })}
                onClick={clearData}
              />
            </div>
            <Table
              type='form'
              rowKey='nodeName'
              columns={columns}
              dataSource={data}
            />
          </>
          :
          <Button
            type='link'
            onClick={() => setSelectInterfaceDrawerVisible(true)}
            children={
              $t({ defaultMessage: 'Select interface' })
            }
          />
      }
      <SelectInterfaceDrawer
        visible={selectInterfaceDrawerVisible}
        setVisible={setSelectInterfaceDrawerVisible}
        handleFinish={handleSelectPort}
        currentVipIndex={index}
        editData={value}
        nodeList={nodeList}
        selectedInterfaces={selectedInterfaces}
        lanInterfaces={lanInterfaces}
      />
    </>
  )
}