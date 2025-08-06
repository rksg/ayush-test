import '@testing-library/jest-dom'

import React from 'react'

import userEvent             from '@testing-library/user-event'
import { Form }              from 'antd'
import { SliderSingleProps } from 'antd/lib/slider'
import { rest }              from 'msw'

import { AccessControlUrls, PoliciesConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { mockServer, render, screen, waitFor }               from '@acx-ui/test-utils'

import { enhancedApplicationPolicyListResponse } from '../../AccessControl/__tests__/fixtures'
import { applicationDetail, avcApp, avcCat }     from '../__tests__/fixtures'

import { ApplicationComponent } from './index'

const applicationResponse = {
  requestId: '508c529a-0bde-49e4-8179-19366f69f31f',
  response: {
    id: 'edac8b0c22e140cd95e63a9e81421576'
  }
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

jest.mock('./ComponentModeForm', () => {
  return {
    ComponentModeForm: () => <div data-testid='component-mode-form'/>
  }
})

const systemDefinedSection = async () => {
  await screen.findByRole('option', { name: 'Web' })

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[1],
    screen.getAllByRole('option', { name: 'All' })[0]
  )

  await screen.findByRole('option', { name: 'BBC' })

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[1],
    screen.getByRole('option', { name: 'Web' })
  )

  await screen.findByRole('option', { name: 'BBC' })

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[2],
    screen.getByRole('option', { name: 'BBC' })
  )
}

const getApplicationDetail = jest.fn()

describe('ApplicationDrawer Component with view mode', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(AccessControlUrls.getEnhancedApplicationPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedApplicationPolicyListResponse))),
      rest.post(AccessControlUrls.addAppPolicy.url,
        (_, res, ctx) => res(ctx.json(applicationResponse))),
      rest.get(AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => res(ctx.json(avcCat))),
      rest.get(AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => res(ctx.json(avcApp))),
      rest.get(AccessControlUrls.getAppPolicy.url,
        (_, res, ctx) => {
          getApplicationDetail()
          return res(
            ctx.json(applicationDetail)
          )
        }),
      rest.get(
        AccessControlUrls.applicationLibrarySettings.url,
        (_, res, ctx) => {
          return res(ctx.json({ version: 'versionValue' }))
        }
      ),
      rest.post(PoliciesConfigTemplateUrlsInfo.getEnhancedApplicationPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedApplicationPolicyListResponse))))
  })

  it('Render ApplicationDrawer component successfully with viewMode', async () => {
    render(
      <Provider>
        <Form>
          <ApplicationComponent
            onlyViewMode={{ id: 'edac8b0c22e140cd95e63a9e81421576', viewText: 'viewText' }}
            isOnlyViewMode={true}
          />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByText('viewText')

    await userEvent.click(screen.getByText('viewText'))

    expect(getApplicationDetail).toHaveBeenCalled()

    await waitFor(async () =>
      expect(await screen.findByText(/application access settings/i)).toBeInTheDocument()
    )

    const rulesCount = await screen.findByText(/rules \(3\)/i)

    await screen.findByText(/uplink \- 1\.25 mbps\|downlink \- 9\.25 mbps/i)

    expect(rulesCount).toBeVisible()

    await userEvent.click(screen.getByText('Cancel'))

    expect(screen.queryByText(/application access settings/i)).not.toBeInTheDocument()
  })
})

describe('ApplicationDrawer Component', () => {
  const mockAddAppPolicyReq = jest.fn()
  beforeEach(() => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedApplicationPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedApplicationPolicyListResponse))
      ), rest.post(
        AccessControlUrls.addAppPolicy.url,
        (_, res, ctx) => {
          mockAddAppPolicyReq()
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
      ), rest.get(
        AccessControlUrls.getAppPolicy.url,
        (_, res, ctx) => {
          getApplicationDetail()
          return res(
            ctx.json(applicationDetail)
          )
        }
      ), rest.get(
        AccessControlUrls.applicationLibrarySettings.url,
        (_, res, ctx) => {
          return res(ctx.json({ version: 'versionValue' }))
        }
      ), rest.post(PoliciesConfigTemplateUrlsInfo.getEnhancedApplicationPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedApplicationPolicyListResponse))))
  })
  it('Render ApplicationDrawer component successfully with new added profile', async () => {
    render(
      <Provider>
        <Form>
          <ApplicationComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1-test')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), 'app1rule1')

    await systemDefinedSection()

    await userEvent.click(screen.getByText(/block applications/i))

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(1\)/i)

    await userEvent.click(screen.getAllByText('Save')[0])

    await waitFor(() => expect(mockAddAppPolicyReq).toBeCalledTimes(1))

    mockServer.use(rest.post(
      AccessControlUrls.getEnhancedApplicationPolicies.url,
      (req, res, ctx) => res(ctx.json({
        ...enhancedApplicationPolicyListResponse,
        data: [
          ...enhancedApplicationPolicyListResponse.data,
          {
            id: 'updateId',
            name: 'app1-test'
          }
        ]
      }))
    ))

    expect(await screen.findByRole('option', { name: 'app1-test' })).toBeVisible()

  })

  it('Render ApplicationDrawer component successfully with UserDefined rule', async () => {
    render(
      <Provider>
        <Form>
          <ApplicationComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1')

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1-test')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), 'app1rule1')

    await userEvent.click(screen.getByText(/user defined/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /application name/i
    }), 'userDefinedApp')

    await userEvent.type(screen.getByRole('textbox', {
      name: /destination ip/i
    }), '1.1.1.1')

    await userEvent.type(screen.getByRole('textbox', {
      name: /netmask/i
    }), '255.255.0.0')

    await userEvent.type(screen.getByRole('textbox', {
      name: /destination port/i
    }), '22')

    await userEvent.click(screen.getByText(/block applications/i))

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(1\)/i)

    await userEvent.click(screen.getAllByText('Save')[0])

    expect(await screen.findByText('Application Access Settings')).toBeVisible()
  })

  it('Render ApplicationDrawer component successfully with edit and del action', async () => {
    render(
      <Provider>
        <Form>
          <ApplicationComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'app1')

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), '-test')

    expect(screen.getByRole('textbox', {
      name: /policy name:/i
    })).toHaveValue('app1-test')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add application rule/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), 'app1rule1')

    await userEvent.click(screen.getByText(/user defined/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /application name/i
    }), 'userDefinedApp')

    await userEvent.type(screen.getByRole('textbox', {
      name: /destination ip/i
    }), '1.1.1.1')

    await userEvent.type(screen.getByRole('textbox', {
      name: /netmask/i
    }), '255.255.0.0')

    await userEvent.type(screen.getByRole('textbox', {
      name: /destination port/i
    }), '22')

    await userEvent.click(screen.getByText(/block applications/i))

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(1\)/i)

    await userEvent.click(screen.getByText('app1rule1'))

    await userEvent.click(screen.getByRole('button', {
      name: 'Edit'
    }))

    await screen.findByText(/application access settings/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /rule name/i
    }), '-modify')

    await userEvent.click(screen.getByText(/rate limit/i))

    await userEvent.click(screen.getByRole('checkbox', {
      name: /max uplink rate:/i
    }))

    await userEvent.click(screen.getByRole('checkbox', {
      name: /max downlink rate:/i
    }))

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText('app1rule1-modify')

    await userEvent.click(screen.getByText('app1rule1-modify'))

    await userEvent.click(screen.getByRole('button', {
      name: 'Edit'
    }))

    await userEvent.click(screen.getAllByText('Cancel')[1])

    await userEvent.click(screen.getByText('app1rule1-modify'))

    await userEvent.click(screen.getByRole('button', {
      name: /delete/i
    }))

    await screen.findByText(/delete rule/i)

    await userEvent.click(screen.getByText(/delete rule/i))

    expect(await screen.findByText(/rules \(0\)/i)).toBeInTheDocument()
  })

  it('Render ApplicationComponent in componentMode successfully', async () => {
    render(
      <Provider>
        <Form>
          <ApplicationComponent editMode={{ isEdit: false, id: '' }} isComponentMode={true}/>
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', requestId: 'requestId1' }
        }
      }
    )

    expect(await screen.findByTestId('component-mode-form')).toBeInTheDocument()
  })

})
