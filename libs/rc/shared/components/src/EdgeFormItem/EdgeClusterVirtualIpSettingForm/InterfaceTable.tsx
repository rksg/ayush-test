import { useEffect, useState } from 'react'

import { Divider } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button, Table }                                              from '@acx-ui/components'
import { EdgeIpModeEnum, EdgePortInfo, EdgeStatus, getIpWithBitMask } from '@acx-ui/rc/utils'

import { SelectInterfaceDrawer } from './SelectInterfaceDrawer'

import { VirtualIpFormType } from '.'

interface InterfaceTableProps {
  value?: { [key: string]: EdgePortInfo | undefined }
  onChange?: (data: unknown) => void
  index?: number
  nodeList?: EdgeStatus[]
  lanInterfaces?: {
    [key: string]: EdgePortInfo[]
  }
  selectedInterfaces?: VirtualIpFormType['vipConfig']
}

interface InterfaceTableDataType {
  nodeName: string
  interface: string
  ip: string
}

export const InterfaceTable = (props: InterfaceTableProps) => {
  const {
    value, onChange, index = 0, nodeList,
    lanInterfaces,selectedInterfaces
  } = props
  const { $t } = useIntl()
  const [selectInterfaceDrawerVisible, setSelectInterfaceDrawerVisible] = useState(false)
  const [data, setData] = useState<InterfaceTableDataType[]>([])

  useEffect(() => {
    if(!nodeList || !value) return
    setData(nodeList.map(node => {
      const target = value[node.serialNumber]
      return {
        nodeName: node.name,
        interface: _.capitalize(target?.portName),
        ip: target?.ipMode === EdgeIpModeEnum.DHCP ?
          $t({ defaultMessage: 'Dynamic' }) :
          getIpWithBitMask(target?.ip, target?.subnet)
      }
    }))
  }, [nodeList, value])

  const handleSelectPort = (data: { [key: string]: EdgePortInfo | undefined }) => {
    onChange?.(data)
  }

  const clearData = () => {
    onChange?.(undefined)
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