import { ChangeEvent, ReactNode, useCallback, useEffect, useState } from 'react'

import { Divider, Dropdown, Input, Menu, Space } from 'antd'
import { debounce, remove }                      from 'lodash'
import { useIntl }                               from 'react-intl'

import { Button }                                                   from '@acx-ui/components'
import { ArrowExpand, SearchOutlined }                              from '@acx-ui/icons'
import { NetworkDevice, NetworkDeviceType, TypeWiseNetworkDevices } from '@acx-ui/rc/utils'

import * as UI        from './styledComponents'
import UnplacedDevice from './UnplacedDevice'

export interface SelectInfo {
    selectedKeys: string[];
}

export function getDeviceFilterLabel (networkDeviceType: NetworkDeviceType) {
  switch (networkDeviceType) {
    case NetworkDeviceType.ap:
      return 'Wi-Fi APs'
    case NetworkDeviceType.lte_ap:
      return 'LTE APs'
    case NetworkDeviceType.switch:
      return 'Switches'
    case NetworkDeviceType.cloudpath:
      return 'Cloudpath Servers'
    default:
      return undefined  // should not reach this statement
  }
}

export function UnplacedDevices (props: { unplacedDevicesState: TypeWiseNetworkDevices }) {
  const { unplacedDevicesState } = props
  const unplacedDevices: NetworkDevice[] = []

  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('All')
  Object.values(unplacedDevicesState)
    .forEach(item => { if(item.length) {unplacedDevices.push(...item)} })
  const [filterDevices, setFilteredDevices] = useState<NetworkDevice[]>(unplacedDevices)

  useEffect(() => {
    setFilteredDevices([])
    Object.values(unplacedDevicesState)
      .forEach(item => { if(item.length) {unplacedDevices.push(...item)} })

    setFilteredDevices(unplacedDevices)

  }, [unplacedDevicesState])

  const { $t } = useIntl()

  const networkDeviceTypeArray = Object.values(NetworkDeviceType)

  const filterDeviceByName = useCallback(debounce((event: ChangeEvent) => {
    const _compare = (event.target as HTMLInputElement).value
    const _filteredDevices = filterDevices.filter((device) => device.name.toLowerCase()
      .includes(_compare.toLocaleLowerCase()))
    setFilteredDevices(_filteredDevices)
  }, 200), [])

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
  return <UI.DeviceList
    style={{ boxShadow: '0px 4px 8px var(--acx-neutrals-40)',
      background: '#fff'
    }}
    size='large'
    header={
      <div><Input
        data-testid='text-search'
        size='middle'
        style={{ width: '144px', maxHeight: '180px' }}
        placeholder='Search...'
        prefix={<SearchOutlined />}
        onChange={(ev) => filterDeviceByName(ev)}
      />
      <Divider type='vertical' style={{ margin: '0 4px' }}/>
      <Dropdown overlay={menuItems}>
        <Button data-testid='trigger' size='middle' style={{ width: '108px' }}>
          <Space>
            { selectedDeviceType !== 'All'
              ? getDeviceFilterLabel(selectedDeviceType as NetworkDeviceType)
              : 'All' }
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
        <Button type='primary'> { $t({ defaultMessage: 'Close' } )}</Button></div>
    }
    bordered
    dataSource={selectedDeviceType === 'All' ?
      unplacedDevices
      : unplacedDevices.filter((device) => device.networkDeviceType === selectedDeviceType)}
    renderItem={(item) =>
      (<UnplacedDevice device={item as NetworkDevice} /> as ReactNode)}
  />
}