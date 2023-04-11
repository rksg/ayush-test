import { useEffect, useState } from 'react'

import {
  Checkbox,
  Form
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import { useIntl }  from 'react-intl'

import { Tooltip }                    from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { useVenuesListQuery }         from '@acx-ui/rc/services'
import { Venue }                      from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'


export function DhcpCheckbox () {
  const intl = useIntl()
  /* eslint-disable max-len */
  const guestDhcpDisableToolTipText = intl.$t({ defaultMessage: 'You cannot enable the DHCP service because the network is activated in a Mesh enabled Venue.' })
  const guestDhcpToolTipText = intl.$t({ defaultMessage: 'RUCKUS DHCP service automatically creates and assigns a new DHCP-Guest Service and DHCP Pool for those Guest WLAN related venues that do not have a specified DHCP Service. Please refer to the DHCP Service at each Venue for more information.' })
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

  useEffect(() => {
    if (venueApi.data && venues) {
      venueApi.data.data?.forEach((venue:Venue) => {
        if (venues.find((x:Venue) => x.venueId === venue.id) && venue.mesh && venue.mesh.enabled) {
          setMeshEnable(true)
        }
      })
    }
  }, [venueApi.data, venues])

  return (
    <Form.Item><>
      <Form.Item
        noStyle
        name='enableDhcp'
        valuePropName='checked'
        initialValue={false}
        children={<Checkbox disabled={meshEnable}>{intl.$t({ defaultMessage: 'Enable RUCKUS DHCP service' })}</Checkbox>}
      />
      <Tooltip title={meshEnable ?
        guestDhcpDisableToolTipText :
        guestDhcpToolTipText
      }
      placement='bottom'
      >
        <QuestionMarkCircleOutlined style={{ marginLeft: -5, marginBottom: -3 }} />
      </Tooltip>
    </>
    </Form.Item>
  )
}



