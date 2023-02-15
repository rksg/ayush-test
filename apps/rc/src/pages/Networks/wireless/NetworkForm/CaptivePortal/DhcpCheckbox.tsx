import { useEffect, useState } from 'react'

import {
  Checkbox,
  Form,
  Tooltip
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import { useIntl }  from 'react-intl'

// import { Button }              from '@acx-ui/components'
import {
  QuestionMarkCircleOutlined
} from '@acx-ui/icons'
import { useVenuesListQuery } from '@acx-ui/rc/services'
import { Venue }              from '@acx-ui/rc/utils'
import { useParams }          from '@acx-ui/react-router-dom'


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

  // const dhcpApi = useGetDefaultGuestDhcpServiceProfileQuery({
  //   params: useParams()
  // })

  // const [guestDhcp, setGuestDhcp] = useState({
  //   guestDhcpIpSpec: '',
  //   guestDhcpToolTipText: '',
  //   guestDhcpLeaseTime: '',
  //   subnetMask: '',
  //   startIpAddress: '',
  //   endIpAddress: ''
  // })

  useEffect(() => {
    if (venueApi.data && venues) {
      venueApi.data.data?.forEach((venue:Venue) => {
        if (venues.find((x:Venue) => x.venueId === venue.id) && venue.mesh && venue.mesh.enabled) {
          setMeshEnable(true)
        }
      })
    }
  }, [venueApi.data, venues])

  // useEffect(() => {
  //   if (dhcpApi.data) {
  //     const dhcp = { ...dhcpApi.data }
  //     const bitmask = IpUtilsService.getBitmaskSize(dhcp.subnetMask)
  //     const guestDhcpIpSpec = dhcp.subnetAddress + '/' + bitmask.toString()
  //     const guestDhcpToolTipText = intl.$t({ defaultMessage: 'Clients will recieve IP addresses in an isolated {guestDhcpIpSpec} network.' },
  //       { guestDhcpIpSpec })
  //     const leaseTime = []
  //     if (dhcp.leaseTimeHours > 0) {
  //       leaseTime.push(dhcp.leaseTimeHours + 'hrs')
  //     }
  //     if (dhcp.leaseTimeMinutes > 0) {
  //       leaseTime.push(dhcp.leaseTimeMinutes + 'mins')
  //     }

  //   }
  // }, [dhcpApi.data])

  return (
    <Form.Item><>
      <Form.Item
        noStyle
        name='enableDhcp'
        valuePropName='checked'
        initialValue={false}
        children={<Checkbox>{intl.$t({ defaultMessage: 'Enable Ruckus DHCP service' })}</Checkbox>}
      />
      {meshEnable &&
      <Tooltip title={guestDhcpDisableToolTipText} placement='bottom'>
        <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
      </Tooltip>}
      {/* <Popover
        placement='bottom'
        content={
          <UI.PopOverDiv>
            <Descriptions title={intl.$t({ defaultMessage: 'Guest network pool details:' })}>
              <Descriptions.Item label={intl.$t({ defaultMessage: 'IP address space' })}>{guestDhcp.guestDhcpIpSpec}</Descriptions.Item>
              <Descriptions.Item label={intl.$t({ defaultMessage: 'Subnet mask' })}>{guestDhcp.subnetMask}</Descriptions.Item>
              <Descriptions.Item label={intl.$t({ defaultMessage: 'Start IP Address' })}>{guestDhcp.startIpAddress}</Descriptions.Item>
              <Descriptions.Item label={intl.$t({ defaultMessage: 'End IP Address' })}>{guestDhcp.endIpAddress}</Descriptions.Item>
              <Descriptions.Item label={intl.$t({ defaultMessage: 'Lease time' })}>{guestDhcp.guestDhcpLeaseTime}</Descriptions.Item>
            </Descriptions>
          </UI.PopOverDiv>
        }
        overlayStyle={{
          width: '800px'
        }}
        trigger='click'
      >
        <Button type='link' style={{ marginLeft: '14px' }}>
          {intl.$t({ defaultMessage: 'More details' })}
        </Button>
      </Popover> */}
    </>
    </Form.Item>
  )
}



