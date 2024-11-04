import { Form } from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { SummaryStep } from './SummaryStep'

// eslint-disable-next-line max-len
const mock_payload='{"venue":{"venueName":"a23","numberOfAp":0,"ssidDescription":"For your school venue, setting up an efficient and secure WiFi network is essential to support both educational and operational needs. Here\'s a recommended list for SSID Profiles:","venueType":"SCHOOL","description":"","numberOfSwitch":0},"vlan":[{"SSID Required":[],"VLAN Name":"Students","VLAN ID":"10","Purpose":"This VLAN is dedicated to student devices, allowing them to connect to the school network for educational purposes. It ensures that student traffic is separated from other types of traffic, providing a secure and efficient environment for learning.","id":"1d895b96472a4a6dbf0426872c9416e9"},{"SSID Required":[],"VLAN Name":"Staff","VLAN ID":"20","Purpose":"This VLAN is for staff members, enabling them to access resources and applications necessary for their work. By isolating staff traffic, it enhances security and ensures that staff can communicate and collaborate effectively.","id":"2d688d54bcd54a88aa27cf0413a91c12"},{"SSID Required":[],"VLAN Name":"Visitors","VLAN ID":"30","Purpose":"This VLAN is designed for visitors to the school, such as parents or guests. It provides internet access while keeping the school\u2019s internal network secure and separate from visitor traffic.","id":"c98bf7394bbb4d37a4e69affbfd959ea"},{"SSID Required":[],"VLAN Name":"Smart Devices","VLAN ID":"40","Purpose":"This VLAN is specifically for smart devices used within the school, such as printers, projectors, and other IoT devices. It helps in managing these devices efficiently and ensures they do not interfere with student or staff traffic.","id":"6239dad2aa494752b377e0690545296b"}],"wlan":[{"SSID Required":["type"],"SSID Type":"open","SSID Objective":"Guest","SSID Name":"Visitors","Purpose":"This network allows visitors to connect to the internet while on campus, ensuring they can access necessary information without compromising the school\'s internal network.","id":"1c9b533dac0f4df9b0a91f88bdd3ddca"},{"SSID Required":["type"],"SSID Type":"open","SSID Objective":"Infrastructure","SSID Name":"Smart Devices","Purpose":"This network is dedicated to smart devices used within the school, such as security cameras and IoT devices, ensuring they operate efficiently without interfering with other networks.","id":"f25dccb970504194b95cd4cf1d2dc197"}]}'

describe('SummaryStep', () => {
  it('should display SummaryStep page correctly', async () => {
    render(
      <Provider>
        <Form>
          <SummaryStep
            payload={mock_payload}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Wireless Networks')).toBeVisible()
  })
})