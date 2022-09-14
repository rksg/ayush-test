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

import { Button, Subtitle }                                              from '@acx-ui/components'
import { useGetDefaultGuestDhcpServiceProfileQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import { IpUtilsService, Venue }                                         from '@acx-ui/rc/utils'
import { useParams }                                                     from '@acx-ui/react-router-dom'

/* eslint-disable max-len */
const guestDhcpDisableToolTipText = 'You cannot enable the DHCP service because the network is activated in a Mesh enabled Venue.'

export function DhcpCheckbox () {
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
      const guestDhcpToolTipText = 'Clients will recieve IP addresses in an isolated ' + guestDhcpIpSpec + ' network.'
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
        children={<Checkbox>Enable Ruckus DHCP service</Checkbox>}
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
            <Subtitle level={4}>Guest network pool details:</Subtitle>
            <label>IP address space:</label> {guestDhcp.guestDhcpIpSpec} <br />
            <label>Subnet mask:</label> {guestDhcp.subnetMask} <br />
            <label>Start IP Address:</label> {guestDhcp.startIpAddress} <br />
            <label>End IP Address:</label> {guestDhcp.endIpAddress} <br />
            <label>Lease time:</label> {guestDhcp.guestDhcpLeaseTime}
          </div>
        } 
        trigger='click'
      >
        <Button type='link' style={{ height: 'auto', marginLeft: '14px' }}>More details</Button>
      </Popover>
    </Form.Item>
  )
}



