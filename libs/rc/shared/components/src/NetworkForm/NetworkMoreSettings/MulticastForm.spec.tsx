/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider }               from '@acx-ui/store'
import { render, screen }         from '@acx-ui/test-utils'

import { MulticastForm } from './MulticastForm'

jest.mock('../../ApCompatibility', () => ({
  ...jest.requireActual('../../ApCompatibility'),
  ApCompatibilityToolTip: () => <div data-testid={'ApCompatibilityToolTip'} />,
  ApCompatibilityDrawer: () => <div data-testid={'ApCompatibilityDrawer'} />
}))

describe('MulticastForm', () => {

  it('after click Multicast Rate Limiting', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <Form>
          <MulticastForm wlanData={null}/>
        </Form>
      </Provider>,
      { route: { params } })

    const multicastRateLimitSwitch = screen.getByTestId('multicastRateLimitSwitch')
    await userEvent.click(multicastRateLimitSwitch)
    expect(await screen.findByTestId('enableMulticastUpLimit')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastDownLimit')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastUpLimit6G')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastDownLimit6G')).toBeVisible()
  })

  it('Test case for Multicast Filter', async ()=> {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <Form>
          <MulticastForm wlanData={null}/>
        </Form>
      </Provider>,
      { route: { params } })

    expect(await screen.findByTestId('multicast-filter-enabled')).toBeVisible()
  })

  it('should render R370 Compatibility ToolTip', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_R370_TOGGLE)

    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(
      <Provider>
        <Form>
          <MulticastForm wlanData={null}/>
        </Form>
      </Provider>,
      { route: { params } })

    const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
    expect(toolTips.length).toBe(1)
    toolTips.forEach(t => expect(t).toBeVisible())
    expect(await screen.findByTestId('ApCompatibilityDrawer')).toBeVisible()
  })
})