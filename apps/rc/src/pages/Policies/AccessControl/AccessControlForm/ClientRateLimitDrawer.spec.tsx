import '@testing-library/jest-dom'

import React from 'react'

import { userEvent } from '@storybook/testing-library'
import { Form }      from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ClientRateLimitDrawer from './ClientRateLimitDrawer'


describe('ClientRateLimitDrawer Component', () => {
  it('Render ClientRateLimitDrawer component successfully', async () => {
    render(
      <Provider>
        <Form>
          <ClientRateLimitDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText(/upload limit/i))
    await userEvent.click(screen.getByText(/download limit/i))

    await userEvent.click(screen.getByText(/upload limit/i))
    await userEvent.click(screen.getByText(/download limit/i))
  })
})
