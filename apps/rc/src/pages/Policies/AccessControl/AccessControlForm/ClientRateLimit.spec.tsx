import '@testing-library/jest-dom'

import React from 'react'

import { userEvent }         from '@storybook/testing-library'
import { fireEvent }         from '@testing-library/react'
import { Form }              from 'antd'
import { SliderSingleProps } from 'antd/lib/slider'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import ClientRateLimit from './ClientRateLimit'

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  const Slider = (props: (SliderSingleProps) & React.RefAttributes<unknown>) => {
    const { min, max, onChange: sliderOnChange } = props
    return <input
      data-testid='mock-slider'
      type='range'
      onChange={(event) => sliderOnChange ? sliderOnChange(Number(event.target.value)) : null}
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

    expect(await screen.findByText(
      'One of the client rate limit setting should be chosen'
    )).toBeVisible()
  })
})
