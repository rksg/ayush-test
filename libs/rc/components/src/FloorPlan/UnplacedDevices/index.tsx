import { ChangeEvent, ReactNode, useEffect, useState } from 'react'

import { Divider, Input, Menu, Space, Typography } from 'antd'
import { remove }                                  from 'lodash'
import { useIntl }                                 from 'react-intl'

import { Button, Dropdown, CaretDownSolidIcon }                     from '@acx-ui/components'
import { SearchOutlined }                                           from '@acx-ui/icons'
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
  const [filterDevices, setFilteredDevices] = useState<NetworkDevice[]>()
  const [filteredText, setFilteredText] = useState<string>('')
  Object.values(unplacedDevicesState)
    .forEach(item => { if(item.length) {unplacedDevices.push(...item)} })

  const { $t } = useIntl()

  const networkDeviceTypeArray = Object.values(NetworkDeviceType)

  useEffect(() => {
    setFilteredDevices([])

    if (selectedDeviceType === 'All') {
      const _filtered: NetworkDevice[] = unplacedDevices
        .filter((device) => device.name.toLowerCase()
          .includes(filteredText.toLowerCase()))
      setFilteredDevices(_filtered)
    } else {
      const _filtered: NetworkDevice[] = unplacedDevices
        .filter((device) => device.networkDeviceType === selectedDeviceType
        && device.name.toLowerCase()
          .includes(filteredText.toLowerCase()))
      setFilteredDevices(_filtered)
    }

  }, [filteredText, selectedDeviceType, unplacedDevicesState])

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

  function filterByName (ev: ChangeEvent) {
    const text = (ev.target as HTMLInputElement).value
    setFilteredText(text)
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
  return <UI.OverlayContainer>
    <UI.DeviceList
      size='large'
      header={
        <div><Input
          data-testid='text-search'
          size='middle'
          style={{ width: '144px', maxHeight: '180px' }}
          placeholder={$t({ defaultMessage: 'Search...' })}
          prefix={<SearchOutlined />}
          onChange={filterByName}
        />
        <Divider type='vertical' style={{ margin: '0 4px' }}/>
        <Dropdown overlay={menuItems}>{() =>
          <Button data-testid='trigger' size='middle' style={{ width: '108px' }}>
            <Space>
              <Typography.Paragraph
                ellipsis={{ rows: 1, expandable: false }}
                style={{
                  width: '72px',
                  margin: '0'
                }}> { selectedDeviceType !== 'All'
                  ? getDeviceFilterLabel(selectedDeviceType as NetworkDeviceType)
                  : $t({ defaultMessage: 'All' }) }
              </Typography.Paragraph>
              <CaretDownSolidIcon />
            </Space>
          </Button>
        }</Dropdown>
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
      dataSource={filterDevices}
      renderItem={(item) =>
        (<UnplacedDevice device={item as NetworkDevice}/> as ReactNode)}
    />
  </UI.OverlayContainer>
}
