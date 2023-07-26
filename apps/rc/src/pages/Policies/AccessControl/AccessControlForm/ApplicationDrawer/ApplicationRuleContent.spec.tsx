import '@testing-library/jest-dom'

import React from 'react'

import { fireEvent }         from '@testing-library/react'
import userEvent             from '@testing-library/user-event'
import { Form }              from 'antd'
import { SliderSingleProps } from 'antd/lib/slider'
import { rest }              from 'msw'

import { AccessControlUrls }          from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { avcApp, avcCat, queryApplication } from '../../__tests__/fixtures'

import ApplicationDrawer from './index'

const applicationResponse = {
  requestId: '508c529a-0bde-49e4-8179-19366f69f31f'
}

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  // eslint-disable-next-line max-len
  const Select = ({ children, onChange, options, showSearch, filterOption, optionFilterProp, defaultValue, ...otherProps }) => {
    if (options) {
      return <select
        role='combobox'
        onChange={e => onChange(e.target.value)}
        {...otherProps}>
        {options.map((option: { value: string }) =>
          <option key={option.value} value={option.value}>{option.value}</option>)}
      </select>
    }
    return <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>
  }

  // @ts-ignore
  Select.Option = ({ children, options, ...otherProps }) => {
    return <option role='option' {...otherProps}>{children}</option>
  }

  const Slider = (props: (SliderSingleProps) & React.RefAttributes<unknown>) => {
    const { min, max, onChange: sliderOnChange } = props
    return <input
      data-testid='mock-slider'
      type='range'
      value={0}
      min={min}
      max={max}
      onChange={(event) => sliderOnChange ? sliderOnChange(Number(event.target.value)) : null}
    />
  }

  return { ...antd, Select, Slider }
})

const mockedUpdateApplication = jest.fn()

describe('ApplicationRuleContent Component', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(queryApplication)
        )
      ), rest.post(
        AccessControlUrls.addAppPolicy.url,
        (_, res, ctx) => res(
          ctx.json(applicationResponse)
        )
      ), rest.get(
        AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => res(
          ctx.json(avcCat)
        )
      ), rest.get(
        AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => res(
          ctx.json(avcApp)
        )
      ))
  })

  it('Render ApplicationDrawer component successfully for access control part', async () => {
    mockServer.use(
      rest.get(
        AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(queryApplication)
        )
      ), rest.post(
        AccessControlUrls.addAppPolicy.url,
        (_, res, ctx) => {
          mockedUpdateApplication()
          return res(
            ctx.json(applicationResponse)
          )
        }
      ), rest.get(
        AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => res(
          ctx.json(avcCat)
        )
      ), rest.get(
        AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => res(
          ctx.json(avcApp)
        )
      ))

    render(
      <Provider>
        <Form>
          <ApplicationDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText('Add New')

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText('Please enter Access Control')

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), 'app1rule1')

    await screen.findByRole('option', { name: 'Web' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[1],
      screen.getByRole('option', { name: 'Web' })
    )

    await screen.findByRole('option', { name: 'BBC' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[2],
      screen.getByRole('option', { name: 'BBC' })
    )

    await userEvent.click(screen.getByText(/qos/i))

    await screen.findByRole('option', { name: 'DSCP' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[3],
      screen.getByRole('option', { name: 'DSCP' })
    )

    await userEvent.click(screen.getByText(/rate limit/i))

    await userEvent.click(screen.getByText(/max uplink rate:/i))

    await userEvent.click(screen.getByText(/max downlink rate:/i))

    fireEvent.change(screen.getAllByTestId('mock-slider')[0], { target: { value: '10' } })

    fireEvent.change(screen.getAllByTestId('mock-slider')[1], { target: { value: '20' } })

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText('app1rule1')

    expect(screen.getByText('app1rule1')).toBeVisible()

  })

  it('Render ApplicationDrawer component successfully for qos content', async () => {
    mockServer.use(
      rest.get(
        AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(queryApplication)
        )
      ), rest.post(
        AccessControlUrls.addAppPolicy.url,
        (_, res, ctx) => res(
          ctx.json(applicationResponse)
        )
      ), rest.get(
        AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => res(
          ctx.json(avcCat)
        )
      ), rest.get(
        AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => res(
          ctx.json(avcApp)
        )
      ))

    render(
      <Provider>
        <Form>
          <ApplicationDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', requestId: 'requestId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.click(await screen.findByText(/qos/i))

    await screen.findByRole('option', { name: 'DSCP' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[3],
      screen.getByRole('option', { name: 'DSCP' })
    )

    await userEvent.click(screen.getByText(/qos/i))

    await screen.findByRole('option', { name: 'BOTH' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[3],
      screen.getByRole('option', { name: 'BOTH' })
    )

    await screen.findAllByRole('option', { name: 'VOICE' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[4],
      screen.getAllByRole('option', { name: 'VOICE' })[0]
    )

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[5],
      screen.getAllByRole('option', { name: 'VOICE' })[1]
    )

    expect(await screen.findByText('Audio/Video')).toBeInTheDocument()
  })

  it('Render ApplicationDrawer component in viewMode successfully', async () => {
    render(
      <Provider>
        <Form>
          <ApplicationDrawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText('app1')

    expect(await screen.findByText('app1')).toBeInTheDocument()

    await screen.findByRole('option', { name: 'app1' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'app1' })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/rules/i)

    await userEvent.click(screen.getAllByText('Cancel')[0])
  })
})
