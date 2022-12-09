import { ReactNode, useState } from 'react'

import { Divider, Dropdown, Input, Menu, Space } from 'antd'
import { remove }                                from 'lodash'
import { useIntl }                               from 'react-intl'

import { Button }                                                   from '@acx-ui/components'
import { ArrowExpand, SearchOutlined }                              from '@acx-ui/icons'
import { NetworkDevice, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'
import { getIntl }                                                  from '@acx-ui/utils'

import * as UI        from './styledComponents'
import UnplacedDevice from './UnplacedDevice'

export interface SelectInfo {
    selectedKeys: string[];
}

export function getDeviceFilterLabel (networkDeviceType: NetworkDeviceType) {
  const { $t } = getIntl()

  switch (networkDeviceType) {
    case NetworkDeviceType.ap:
      return $t({ defaultMessage: 'Wi-Fi APs' })
    case NetworkDeviceType.lte_ap:
      return $t({ defaultMessage: 'LTE APs' })
    case NetworkDeviceType.switch:
      return $t({ defaultMessage: 'Switches' })
    case NetworkDeviceType.cloudpath:
      return $t({ defaultMessage: 'Cloudpath Servers' })
    default:
      return undefined  // should not reach this statement
  }
}

export function UnplacedDevices (props: { unplacedDevicesState: TypeWiseNetworkDevices,
  closeDropdown: Function }) {
  const { unplacedDevicesState, closeDropdown } = props
  const unplacedDevices: NetworkDevice[] = []

  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('All')
  Object.values(unplacedDevicesState)
    .forEach(item => { if(item.length) {unplacedDevices.push(...item)} })

  const { $t } = useIntl()

  const networkDeviceTypeArray = Object.values(NetworkDeviceType)

  // need to handle this with lte_enabled once we get lte_enabled status from userProfile.
  // refer current implentation in rc-ui. for now skipping lte_ap
  // option from dropdown as per current implematation in rc-ui.
  remove(networkDeviceTypeArray, type => type === NetworkDeviceType.lte_ap)

  const items = [{
    key: 'All',
    label: $t({ defaultMessage: 'All' })
  }]

  networkDeviceTypeArray.map((deviceType) => {
    const _deviceType = getDeviceFilterLabel(deviceType)
    if (!_deviceType)
      return false
    return items.push({
      key: '' + deviceType,
      label: _deviceType as string
    })
  })

  function selectedOption (item: SelectInfo) {
    setSelectedDeviceType(item.selectedKeys[0])
  }

  const menuItems = <Menu
    selectable
    defaultSelectedKeys={['All']}
    items={items}
    onSelect={(item) => selectedOption(item)}
  />

  function closeOverlay () {
    closeDropdown(true)
  }
  return <UI.DeviceList
    size='large'
    header={
      <div><Input
        data-testid='text-search'
        size='middle'
        style={{ width: '144px', maxHeight: '180px' }}
        placeholder={$t({ defaultMessage: 'Search...' })}
        prefix={<SearchOutlined />}
      />
      <Divider type='vertical' style={{ margin: '0 4px' }}/>
      <Dropdown overlay={menuItems}>
        <Button data-testid='trigger' size='middle' style={{ width: '108px' }}>
          <Space>
            { selectedDeviceType !== 'All'
              ? getDeviceFilterLabel(selectedDeviceType as NetworkDeviceType)
              : $t({ defaultMessage: 'All' }) }
            <ArrowExpand />
          </Space>
        </Button>
      </Dropdown>
      </div>
    }

    footer={
      <div style={{
        display: 'flex',
        justifyContent: 'end'
      }}>
        <Button type='primary' onClick={closeOverlay}>
          { $t({ defaultMessage: 'Close' } )}</Button></div>
    }
    bordered
    dataSource={selectedDeviceType === 'All' ?
      unplacedDevices
      : unplacedDevices.filter((device) => device.networkDeviceType === selectedDeviceType)}
    renderItem={(item) =>
      (<UnplacedDevice device={item as NetworkDevice}/> as ReactNode)}
  />
}