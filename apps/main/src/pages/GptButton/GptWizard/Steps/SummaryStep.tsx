import { Form } from 'antd'

import { NetworkTypeEnum } from '@acx-ui/rc/utils'

export function SummaryStep (props: {
  payload: string
}) {

  const step4payload = props.payload ? JSON.parse(props.payload) : {}


  const getNetworkTypeDescription = (type: string) => {
    if (type === NetworkTypeEnum.OPEN) {
      return 'Open Network'
    } else if (type === NetworkTypeEnum.PSK) {
      return 'Passphrase (PSK/SAE)'
    } else if (type === NetworkTypeEnum.DPSK) {
      return 'Dynamic Pre-Shared Key (DPSK)'
    } else if (type === NetworkTypeEnum.AAA) {
      return 'Enterprise AAA (802.1X)'
    } else if (type === NetworkTypeEnum.HOTSPOT20) {
      return 'Hotspot 2.0 Access'
    } else if (type === NetworkTypeEnum.CAPTIVEPORTAL) {
      return 'Captive Portal'
    } else {
      return 'Unknown Type' // 默认值
    }
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
          step4payload?.venue?.venueName}</b>?
      </span>


      <Form.Item
        label={'Wireless Networks'}
        children={<ul>
          {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
            step4payload?.wlan?.map((item: any, index: number) => (
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
            step4payload?.vlan?.map((item: any, index: number) => (
              <li key={index}>{`${item['VLAN Name']} @ VLAN  ${item['VLAN ID']}`}</li>
            ))}
        </ul>}
      />

    </div>
  </div>
}
