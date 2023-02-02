import '@testing-library/jest-dom'

import React from 'react'

import { userEvent }                           from '@storybook/testing-library'
import { fireEvent }                           from '@testing-library/react'
import { Form }                                from 'antd'
import { SliderRangeProps, SliderSingleProps } from 'antd/lib/slider'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ClientRateLimit from './ClientRateLimit'

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  const Slider = (props: (SliderSingleProps | SliderRangeProps) & React.RefAttributes<unknown>) => {
    const { min, max } = props
    return <input
      data-testid='mock-slider'
      type='range'
      value={0}
      min={min}
      max={max}
    />
  }

  return {
    ...antd,
    Slider
  }
})

describe('ClientRateLimitDrawer Component', () => {
  it('Render ClientRateLimitDrawer component successfully', async () => {
    render(
      <Provider>
        <Form>
          <ClientRateLimit />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText(/upload limit/i))
    await userEvent.click(screen.getByText(/download limit/i))

    fireEvent.change(screen.getAllByTestId('mock-slider')[0], { target: { value: '10' } })

    await userEvent.click(screen.getByText(/upload limit/i))
    await userEvent.click(screen.getByText(/download limit/i))
  })
})
