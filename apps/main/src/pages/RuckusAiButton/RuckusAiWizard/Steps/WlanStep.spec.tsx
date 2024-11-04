import { Form } from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { WlanStep } from './WlanStep'

// eslint-disable-next-line max-len
const mock_description = 'For your school venue, setting up an efficient and secure WiFi network is essential to support both educational and operational needs. Here\'s a recommended list for SSID Profiles:'
// eslint-disable-next-line max-len
const mock_payload='[{"id":"bde0f76d1baf42fca9c692217a2c513d","SSID Name":"Teachers","SSID Objective":"Internal","SSID Required":["authRadiusId"],"Purpose":"This network is for teachers to access educational resources, communicate with colleagues, and manage their classes securely."},{"id":"ad6f0da61aa443dd8456a75c8307d614","SSID Name":"Students","SSID Objective":"Internal","SSID Required":["authRadiusId"],"Purpose":"This network is designed for students to connect their devices for learning purposes, access online materials, and collaborate on projects."},{"id":"1c9b533dac0f4df9b0a91f88bdd3ddca","SSID Name":"Visitors","SSID Objective":"Guest","SSID Required":["portalServiceProfileId"],"Purpose":"This network allows visitors to connect to the internet while on campus, ensuring they can access necessary information without compromising the school\'s internal network."},{"id":"3ac16f382a874b30ab273abc487e31b6","SSID Name":"Admin","SSID Objective":"Internal","SSID Required":["authRadiusId"],"Purpose":"This network is for administrative staff to manage school operations, access sensitive information, and communicate securely."},{"id":"f25dccb970504194b95cd4cf1d2dc197","SSID Name":"Smart Devices","SSID Objective":"Infrastructure","SSID Required":["dpskServiceProfileId"],"Purpose":"This network is dedicated to smart devices used within the school, such as security cameras and IoT devices, ensuring they operate efficiently without interfering with other networks."}]'
describe('WlanStep', () => {
  it('should display WlanStep page correctly', async () => {

    render(
      <Provider>
        <Form>
          <WlanStep
            payload={mock_payload}
            description={mock_description}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Add Network Profile')).toBeVisible()
  })
})