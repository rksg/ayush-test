import { NetworkTypeEnum } from '@acx-ui/rc/utils';
import { Form } from 'antd';

export function SummaryStep() {



  const step4payload = {payload: JSON.stringify({
    "venue": {
      "venueName": "JK Venue",
      "numberOfAp": 6,
      "ssidDescription": "For JK Venue, a hotel with 6 WiFi access points and 7 switches, setting up a robust and secure WiFi network is essential to cater to both guest and operational needs. Here's a recommended list for SSID Profiles:",
      "venueType": "HOTEL",
      "description": "Good",
      "numberOfSwitch": 7
    },
    "vlan": [
      { "VLAN Name": "Guest", "VLAN ID": 10 },
      { "VLAN Name": "Staff", "VLAN ID": 20 },
      { "VLAN Name": "VIP", "VLAN ID": 30 },
      { "VLAN Name": "IoT", "VLAN ID": 40 },
      { "VLAN Name": "Public", "VLAN ID": 50 }
    ],
    "ssid": [
      {
        "SSID Type": "guest",
        "SSID Objective": "Guest",
        "SSID Name": "Guest",
        "Purpose": "This network is for all hotel guests to access the internet freely during their stay."
      },
      {
        "SSID Type": "aaa",
        "SSID Objective": "Internal",
        "SSID Name": "Staff",
        "Purpose": "This network is for hotel staff to manage operations and communicate effectively."
      },
      {
        "SSID Type": "guest",
        "SSID Objective": "VIP",
        "SSID Name": "VIP",
        "Purpose": "This network is reserved for high-priority guests, providing them with a premium internet experience."
      },
      {
        "SSID Type": "dpsk",
        "SSID Objective": "Infrastructure",
        "SSID Name": "IoT",
        "Purpose": "This network supports infrastructure devices like security cameras and smart devices used throughout the hotel."
      },
      {
        "SSID Type": "open",
        "SSID Objective": "Public",
        "SSID Name": "Public",
        "Purpose": "This network is available for public use without authentication, ideal for visitors to the hotel."
      }
    ]
  })
}

const getNetworkTypeDescription = (type: string) => {
  if (type === NetworkTypeEnum.OPEN) {
    return 'Open Network';
  } else if (type === NetworkTypeEnum.PSK) {
    return 'Passphrase (PSK/SAE)';
  } else if (type === NetworkTypeEnum.DPSK) {
    return 'Dynamic Pre-Shared Key (DPSK)';
  } else if (type === NetworkTypeEnum.AAA) {
    return 'Enterprise AAA (802.1X)';
  } else if (type === NetworkTypeEnum.HOTSPOT20) {
    return 'Hotspot 2.0 Access';
  } else if (type === NetworkTypeEnum.CAPTIVEPORTAL) {
    return 'Captive Portal';
  } else {
    return 'Unknown Type'; // 默认值
  }
}


  return <div style={{ display: 'flex', flexDirection: 'column' }}>
  <div style={{
    flex: '0 1 auto',
    // padding: '30px',
    display: 'flex',          // 启用 Flexbox 布局
    flexDirection: 'column',  // 垂直排列子元素
    justifyContent: 'center' // 垂直居中子元素
    // alignItems: 'center'      // 水平居中子元素
  }}> {/* 顶部部分 */}

    <span style={{ fontSize: '24px', fontWeight: 600, marginTop: '30px', fontFamily: 'Montserrat' }}>
      Summary
    </span>
    <span style={{ fontSize: '16px', color: '#808284', margin: '20px 0' }}>
      Alright, we have completed the setup for your network. Below is a summary.<br />
      Would you like me to create these configurations and apply them to the venue <b>{step4payload.payload && JSON.parse(step4payload.payload).venue.venueName}</b>?
    </span>


    <Form.Item
      label={'Wireless Networks'}
      children={<ul>
        {step4payload.payload && JSON.parse(step4payload.payload).ssid &&
          JSON.parse(step4payload.payload).ssid.map((item: any, index: number) => (
            <li key={index}>{`${item['SSID Name']} with ${getNetworkTypeDescription(item['SSID Type'])}`}</li>
          ))}
      </ul>
      }
    />
    <Form.Item
      label={'VLAN Configuration'}
      children={<ul>
        {step4payload.payload && JSON.parse(step4payload.payload).vlan
          && JSON.parse(step4payload.payload).vlan.map((item: any, index: number) => (
            <li key={index}>{`${item['VLAN Name']} @ VLAN  ${item['VLAN ID']}`}</li>
          ))}
      </ul>}
    />

  </div>
</div>
}
