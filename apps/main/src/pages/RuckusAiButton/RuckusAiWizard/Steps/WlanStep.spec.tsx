import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { mock_payload, mock_description } from './__test__/WlanStepFixtures'
import { WlanStep }                       from './WlanStep'


jest.mock('@acx-ui/rc/services', () => {
  const actualModule = jest.requireActual('@acx-ui/rc/services')
  return {
    ...actualModule,
    useNetworkListQuery: () => [
      jest.fn(() => ({
        unwrap: jest.fn().mockResolvedValue([{ name: 'wlan1' }])
      }))
    ]
  }
})

describe('WlanStep', () => {
  it('should display WlanStep page and add correctly', async () => {
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
    userEvent.click(screen.getByRole('button', { name: /Add Network Profile/i }))
    expect(await screen.findByText('3')).toBeVisible()
    await userEvent.type(screen.getByTestId('wlan-name-input-2'), 'wlan1')
    expect(screen.getByTestId('wlan-name-input-2')).toHaveValue('wlan1')
    await userEvent.type(screen.getByTestId('wlan-name-input-2'), 'wlan3')
  })
})
