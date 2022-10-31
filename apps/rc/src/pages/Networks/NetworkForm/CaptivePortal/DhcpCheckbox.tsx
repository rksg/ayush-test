import { useEffect, useState } from 'react'

import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import {
  Checkbox,
  Form,
  Popover,
  Tooltip
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import { useIntl }  from 'react-intl'

import { Button, Subtitle }                                              from '@acx-ui/components'
import { useGetDefaultGuestDhcpServiceProfileQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import { IpUtilsService, Venue }                                         from '@acx-ui/rc/utils'
import { useParams }                                                     from '@acx-ui/react-router-dom'

export function DhcpCheckbox () {
  const intl = useIntl()
  /* eslint-disable max-len */
  const guestDhcpDisableToolTipText = intl.$t({ defaultMessage: 'You cannot enable the DHCP service because the network is activated in a Mesh enabled Venue.' })
  const [
    venues
  ] = [
    useWatch('venues')
  ]
  const [meshEnable, setMeshEnable] = useState(false)
  const venueApi = useVenuesListQuery({
    params: {
      networkId: 'UNKNOWN-NETWORK-ID', ...useParams()
    },
    payload: {
      fields: ['name','mesh','id'],
      pageSize: 10000
    }
  })

  const dhcpApi = useGetDefaultGuestDhcpServiceProfileQuery({
    params: useParams()
  })

  const [guestDhcp, setGuestDhcp] = useState({
    guestDhcpIpSpec: '',
    guestDhcpToolTipText: '',
    guestDhcpLeaseTime: '',
    subnetMask: '',
    startIpAddress: '',
    endIpAddress: ''
  })

  useEffect(() => {
    if (venueApi.data && venues) {
      venueApi.data.data?.forEach((venue:Venue) => {
        if (venues.find((x:Venue) => x.venueId === venue.id) && venue.mesh && venue.mesh.enabled) {
          setMeshEnable(true)
        }
      })
    }
  }, [venueApi.data, venues])

  useEffect(() => {
    if (dhcpApi.data) {
      const dhcp = { ...dhcpApi.data }
      const bitmask = IpUtilsService.getBitmaskSize(dhcp.subnetMask)
      const guestDhcpIpSpec = dhcp.subnetAddress + '/' + bitmask.toString()
      const guestDhcpToolTipText = intl.$t({ defaultMessage: 'Clients will recieve IP addresses in an isolated {guestDhcpIpSpec} network.' },
        { guestDhcpIpSpec })
      const leaseTime = []
      if (dhcp.leaseTimeHours > 0) {
        leaseTime.push(dhcp.leaseTimeHours + 'hrs')
      }
      if (dhcp.leaseTimeMinutes > 0) {
        leaseTime.push(dhcp.leaseTimeMinutes + 'mins')
      }
      const guestDhcpLeaseTime = leaseTime.join(',')
      setGuestDhcp({
        ...dhcpApi.data,
        guestDhcpIpSpec,
        guestDhcpToolTipText,
        guestDhcpLeaseTime
      })
    }
  }, [dhcpApi.data])

  return (
    <Form.Item>
      <Form.Item
        noStyle
        name='dhcpCheckbox'
        valuePropName='checked'
        initialValue={false}
        children={<Checkbox>{intl.$t({ defaultMessage: 'Enable Ruckus DHCP service' })}</Checkbox>}
      />
      <Tooltip title={meshEnable ?
        guestDhcpDisableToolTipText :
        guestDhcp.guestDhcpToolTipText
      }
      placement='bottom'
      >
        <QuestionCircleOutlined />
      </Tooltip>
      <Popover
        placement='bottom'
        content={
          <div>
            <Subtitle level={4}>{intl.$t({ defaultMessage: 'Guest network pool details:' })}</Subtitle>
            <label>{intl.$t({ defaultMessage: 'IP address space:' })}</label> {guestDhcp.guestDhcpIpSpec} <br />
            <label>{intl.$t({ defaultMessage: 'Subnet mask:' })}</label> {guestDhcp.subnetMask} <br />
            <label>{intl.$t({ defaultMessage: 'Start IP Address:' })}</label> {guestDhcp.startIpAddress} <br />
            <label>{intl.$t({ defaultMessage: 'End IP Address:' })}</label> {guestDhcp.endIpAddress} <br />
            <label>{intl.$t({ defaultMessage: 'Lease time:' })}</label> {guestDhcp.guestDhcpLeaseTime}
          </div>
        }
        trigger='click'
      >
        <Button type='link' style={{ height: 'auto', marginLeft: '14px' }}>More details</Button>
      </Popover>
    </Form.Item>
  )
}



