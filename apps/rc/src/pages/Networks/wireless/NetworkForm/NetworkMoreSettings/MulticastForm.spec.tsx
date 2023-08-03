/* eslint-disable max-len */
import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { useIsSplitOn }           from '@acx-ui/feature-toggle'
import { Provider }               from '@acx-ui/store'
import { within, render, screen } from '@acx-ui/test-utils'

import { MulticastForm } from './MulticastForm'

describe('MulticastForm', () => {

  it('after click Multicast Rate Limiting', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <Form>
          <MulticastForm/>
        </Form>
      </Provider>,
      { route: { params } })

    const multicastRateLimitSwitch = screen.getByText(/Multicast Rate Limiting/i)
    await userEvent.click(within(multicastRateLimitSwitch).getByRole('switch'))
    expect(await screen.findByTestId('enableMulticastUpLimit')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastDownLimit')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastUpLimit6G')).toBeVisible()
    expect(await screen.findByTestId('enableMulticastDownLimit6G')).toBeVisible()
  })

  it('Test case for Multicast Filter', async ()=> {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    // eslint-disable-next-line testing-library/no-render-in-setup
    render(
      <Provider>
        <Form>
          <MulticastForm/>
        </Form>
      </Provider>,
      { route: { params } })

    expect(await screen.findByTestId('multicast-filter-enabled')).toBeVisible()
  })
})