import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mock_payload } from './__test__/SummaryStepFixtures'
import { SummaryStep }  from './SummaryStep'


jest.mock('./SummaryPages/SwitchConfigurationSummaryPage', () => ({
  SwitchConfigurationSummaryPage: () => <div>Switch Configuration Summary Page</div>
}))

jest.mock('./SummaryPages/NetworkSummaryPage', () => ({
  NetworkSummaryPage: () => <div>Network Summary Page</div>
}))

describe('SummaryStep', () => {
  it('should display SummaryStep page correctly', async () => {
    render(
      <Provider>
        <Form>
          <SummaryStep
            setCurrentStep={jest.fn()}
            currentStep={3}
            payload={mock_payload}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Wireless Networks')).toBeVisible()
  })

  it('should click Network summary correctly', async () => {
    render(
      <Provider>
        <Form>
          <SummaryStep
            setCurrentStep={jest.fn()}
            currentStep={3}
            payload={mock_payload}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Wireless Networks')).toBeVisible()
    const network1 = await screen.findByText('network1 with Open Network')
    await userEvent.click(network1)
    expect(await screen.findByText('Network Summary Page')).toBeVisible()
  })


  it('should click switch configuration summary correctly', async () => {
    render(
      <Provider>
        <Form>
          <SummaryStep
            setCurrentStep={jest.fn()}
            currentStep={3}
            payload={mock_payload}
          />
        </Form>
      </Provider>)
    expect(await screen.findByText('Wireless Networks')).toBeVisible()
    const switchConfig1 = await screen.findByText('switchConfig1 @ VLAN 10')
    await userEvent.click(switchConfig1)
    expect(await screen.findByText('Switch Configuration Summary Page')).toBeVisible()
  })
})
