import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'

// Waiting for new UX design
export function SummaryStep (props: {
  payload: string
}) {
  const { $t } = useIntl()
  const data = props.payload ? JSON.parse(props.payload) : {}

  const getNetworkTypeDescription = (type: NetworkTypeEnum) => {
    return $t(networkTypes[type]) || 'Unknown Type'
  }

  return <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{
      flex: '0 1 auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>

      <span style={{ fontSize: '24px',
        fontWeight: 600,
        marginTop: '30px',
        fontFamily: 'Montserrat' }}>
      Summary
      </span>
      <span style={{ fontSize: '16px', color: '#808284', margin: '20px 0' }}>
      Alright, we have completed the setup for your network. Below is a summary.<br />
      Would you like me to create these configurations and apply them to the venue <b>{
          data?.venue?.venueName}</b>?
      </span>


      <Form.Item
        label={'Wireless Networks'}
        children={<ul>
          {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data?.wlan?.map((item: any, index: number) => (
              <li key={index}>
                {`${item['SSID Name']} with ${getNetworkTypeDescription(item['SSID Type'])}`}</li>
            ))}
        </ul>
        }
      />
      <Form.Item
        label={'VLAN Configuration'}
        children={<ul>
          {// eslint-disable-next-line @typescript-eslint/no-explicit-any
            data?.vlan?.map((item: any, index: number) => (
              <li key={index}>{`${item['VLAN Name']} @ VLAN  ${item['VLAN ID']}`}</li>
            ))}
        </ul>}
      />

    </div>
  </div>
}
