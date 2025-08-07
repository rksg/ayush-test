import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed }                    from '@acx-ui/feature-toggle'
import { AccessControlUrls, PoliciesConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                          from '@acx-ui/store'
import { mockServer, render, screen, within }                from '@acx-ui/test-utils'

import { enhancedDevicePolicyListResponse } from '../../AccessControl/__tests__/fixtures'
import {
  devicePolicyDetailResponse,
  devicePolicyDetailWith32RulesResponse,
  devicePolicyListResponse } from '../__tests__/fixtures'

import { DeviceOSComponent } from './index'

const queryDevice = [
  {
    id: '173f4a0aa7da4711804b065dcec2c6a4',
    name: 'allowl2',
    rulesCount: 2,
    networksCount: 0
  },
  {
    id: 'fdd2bc421cb445daac8937dbb2366f5e',
    name: 'device1',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: 'ab757e5bdcfc4c70a3a8382d33a6d598',
    name: 'device2',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '2788474403774ba4959c06c7a1db71ec',
    name: 'device3',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '84fe7ef4e41144cda3198a2e2ed86988',
    name: 'device4',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: 'dc29b08b69ce448a94b66e24445232a9',
    name: 'device5',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '29e467e4102d4e5f9d4c41600b97ece9',
    name: 'device55',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '9350d7dba781406499f12e707a4161fc',
    name: 'device6',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '629032e5d3664d38a51d29cb7152024c',
    name: 'device7',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '361a8e49222a4cbeae2bc6c7f0127dca',
    name: 'device8',
    rulesCount: 1,
    networksCount: 0
  }
]

const queryDeviceUpdate = [
  ...queryDevice,
  {
    id: 'acd2bc421cb445daac8937dbb2366f57',
    name: 'device1-another'
  }
]

const addDevicePolicyResponse = {
  requestId: '508c529a-0bde-49e4-8179-19366f69f31f',
  response: devicePolicyDetailResponse
}

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, options, ...otherProps }) => {
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

  return { ...antd, Select }
})

jest.mock('./ComponentModeForm', () => {
  return {
    ComponentModeForm: () => <div data-testid='component-mode-form'/>
  }
})

const selectOptionSet = async (device: string, vendor: string) => {
  await screen.findByRole('combobox', { name: 'Device Type' })

  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Device Type' }), device)

  expect(screen.queryByRole('option', { name: device })).toBeVisible()

  await screen.findByRole('option', { name: vendor })

  // eslint-disable-next-line max-len
  await userEvent.selectOptions(screen.getByRole('combobox', { name: 'OS or Manufacturer' }), vendor)

  expect(screen.queryByRole('option', { name: vendor })).toBeVisible()
}

describe('DeviceOSDrawer Component setting I', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))),
      rest.get(AccessControlUrls.getDevicePolicyList.url,
        (_, res, ctx) => res(ctx.json(devicePolicyListResponse))),
      rest.post(PoliciesConfigTemplateUrlsInfo.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))),
      rest.post(AccessControlUrls.addDevicePolicy.url,
        (_, res, ctx) => { return res(ctx.json(addDevicePolicyResponse)) }),
      rest.get(
        AccessControlUrls.applicationLibrarySettings.url,
        (_, res, ctx) => {
          return res(ctx.json({ version: 'versionValue' }))
        }
      )
    )
  })

  it('Render DeviceOSComponent successfully with Smartphone & Ios', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await selectOptionSet('Smartphone', 'Ios')

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.click(await screen.findByRole('cell', {
      name: /smartphone/i
    }))

    await screen.findByRole('button', {
      name: /delete/i
    })

    await userEvent.click(screen.getByRole('button', {
      name: /delete/i
    }))

    await screen.findByText(/delete rule/i)

    await userEvent.click(screen.getByRole('button', {
      name: /delete rule/i
    }))

    await userEvent.click(screen.getAllByText('Save')[0])
  })

  it('Render DeviceOSComponent successfully with Tablet & AmazonKindle', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await selectOptionSet('Tablet', 'AmazonKindle')

    expect(await screen.findByText('Tablet')).toBeInTheDocument()

  })

  it('Render DeviceOSComponent successfully with Voip & CiscoIpPhone', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await selectOptionSet('Voip', 'CiscoIpPhone')

    expect(await screen.findByText('Voip')).toBeInTheDocument()

  })
})

describe('DeviceOSComponent setting II', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))
      ),
      rest.get(AccessControlUrls.getDevicePolicyList.url,
        (_, res, ctx) => res(ctx.json(queryDeviceUpdate))),
      rest.post(PoliciesConfigTemplateUrlsInfo.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))),
      rest.post(AccessControlUrls.addDevicePolicy.url,
        (_, res, ctx) => res(ctx.json(addDevicePolicyResponse)))
    )
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  it('Render DeviceOSComponent successfully with Gaming & XBOX360', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryDeviceUpdate)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await selectOptionSet('Gaming', 'Xbox360')

    expect(await screen.findByText('Gaming')).toBeInTheDocument()

  })

  it('Render DeviceOSComponent successfully without Gaming & PlayStation', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please enter rule name/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please select the device type option/i)

    await screen.findByText(/please select the os or manufacturer option/i)

    await screen.findByRole('option', { name: 'Select...' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[1],
      screen.getByRole('option', { name: 'Gaming' })
    )

    await screen.findByRole('option', { name: 'All' })

    expect(screen.queryByRole('option', { name: 'PlayStation' })).toBeNull()

  })

  it.skip('Render DeviceOSComponent successfully with Gaming & PlayStation', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.post(
      AccessControlUrls.addDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(addDevicePolicyResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please enter rule name/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await selectOptionSet('Gaming', 'PlayStation')

    await screen.findByRole('option', { name: 'PlayStation' })

    expect(screen.queryByText(/please select the device type option/i)).toBeNull()

    expect(screen.queryByText(/please select the os or manufacturer option/i)).toBeNull()

  })

  it('Render DeviceOSComponent successfully with Printer & HpPrinter', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await selectOptionSet('Printer', 'HpPrinter')

    expect(await screen.findByText('Printer')).toBeInTheDocument()

  })

  it('Render DeviceOSComponent successfully with IotDevice & NextCamera', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await selectOptionSet('IotDevice', 'NestCamera')

    expect(await screen.findByText('IotDevice')).toBeInTheDocument()

  })
})

describe('DeviceOSComponent setting III', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))
      ),
      rest.get(AccessControlUrls.getDevicePolicyList.url,
        (_, res, ctx) => res(ctx.json(queryDevice))),
      rest.post(PoliciesConfigTemplateUrlsInfo.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))),
      rest.post(AccessControlUrls.addDevicePolicy.url,
        (_, res, ctx) => res(ctx.json(addDevicePolicyResponse)))
    )
  })

  it('Render DeviceOSComponent successfully with HomeAvEquipment & SonyPlayer', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await selectOptionSet('HomeAvEquipment', 'SonyPlayer')

    expect(await screen.findByText('HomeAvEquipment')).toBeInTheDocument()

  })

  it('Render DeviceOSComponent successfully with WdsDevice & TelenetCpe', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await selectOptionSet('WdsDevice', 'TelenetCpe')

    expect(await screen.findByText('WdsDevice')).toBeInTheDocument()

  })
})

describe('DeviceOSComponent', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))
      ), rest.get(
        AccessControlUrls.getDevicePolicyList.url,
        (_, res, ctx) => res(
          ctx.json(devicePolicyListResponse)
        )
      ), rest.post(PoliciesConfigTemplateUrlsInfo.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse)))
    )
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })

  it('Render DeviceOSComponent successfully', async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.addDevicePolicy.url,
        (_, res, ctx) => res(
          ctx.json(addDevicePolicyResponse)
        )
      ))

    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await userEvent.click(screen.getAllByText('Cancel')[0])

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/device & os access settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'device1-another')

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add rule/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await userEvent.click(screen.getAllByText('Save')[1])

    await selectOptionSet('Laptop', 'Windows')

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.click(await screen.findByText(/rule1/i))

    await userEvent.click(screen.getByRole('button', {
      name: 'Edit'
    }))

    await userEvent.click(screen.getByRole('checkbox', {
      name: /from client:/i
    }))

    await userEvent.click(screen.getByRole('checkbox', {
      name: /to client:/i
    }))

    await userEvent.type(screen.getByRole('textbox', {
      name: /vlan/i
    }), '12')

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.click(screen.getAllByText('Save')[0])

    mockServer.use(rest.post(
      AccessControlUrls.getEnhancedDevicePolicies.url,
      (req, res, ctx) => res(ctx.json({
        ...enhancedDevicePolicyListResponse,
        data: [
          ...enhancedDevicePolicyListResponse.data,
          {
            id: '84eb837c59e84761a1c836591d43e334',
            name: 'device1-another'
          }
        ]
      }))
    ))

    expect(await screen.findByRole('option', { name: 'device1-another' })).toBeInTheDocument()
  })

  const deleteTheFirstRowOfRules = async () => {
    await userEvent.click(within(screen.getAllByRole('row')[1]).getByRole('radio'))

    await screen.findByText(/1 selected/i)

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await screen.findByRole('button', { name: 'Delete Rule' })

    await userEvent.click(screen.getByRole('button', { name: 'Delete Rule' }))
  }

  // eslint-disable-next-line max-len
  it.skip('Render DeviceOSComponent successfully with max number of rules validation', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyDetailWith32RulesResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe', requestId: 'requestId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'device2' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'device3' })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/rules \(32\)/i)

    // max = 32 in normal case without PlayStation and Xbox
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    await deleteTheFirstRowOfRules()

    await screen.findByText(/rules \(31\)/i)

    // max = 32 in normal case without PlayStation and Xbox
    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await screen.findByText(/add rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please enter rule name/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await selectOptionSet('Gaming', 'PlayStation')

    await screen.findByRole('option', { name: 'PlayStation' })

    // not able to select PlayStation with 31 existing normal rules
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/must reserve 1 additional rule slot for PlayStation/i)).not.toBeNull()

    await selectOptionSet('Gaming', 'Xbox')

    await screen.findByRole('option', { name: 'Xbox' })

    // not able to select Xbox with 31 existing normal rules
    expect(await screen.findByText(/must reserve 1 additional rule slot for Xbox/i)).not.toBeNull()

    await userEvent.click(screen.getAllByText('Cancel')[1])

    await deleteTheFirstRowOfRules()

    await screen.findByText(/rules \(30\)/i)

    // max = 32 in normal case without PlayStation and Xbox
    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await screen.findByText(/add rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please enter rule name/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await selectOptionSet('Gaming', 'Xbox')

    await screen.findByRole('option', { name: 'Xbox' })

    // able to select Xbox with 30 existing normal rules
    expect(screen.queryByText(/must reserve 1 additional rule slot for Xbox/i)).toBeNull()

    await selectOptionSet('Gaming', 'PlayStation')

    await screen.findByRole('option', { name: 'PlayStation' })

    // able to select PlayStation with 30 existing normal rules
    expect(screen.queryByText(/must reserve 1 additional rule slot for PlayStation/i)).toBeNull()

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(31\)/i)

    // max = 31 for the case of PlayStation in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    await userEvent.click(screen.getAllByText('Cancel')[0])

    expect(await screen.findByText(/rules \(0\)/i)).toBeInTheDocument()
  })

  // eslint-disable-next-line max-len
  it.skip('Render DeviceOSComponent successfully with Xbox in the existing rules', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    const devicePolicyDetailWith31RulesWithXboxResponse = {
      ...devicePolicyDetailWith32RulesResponse,
      rules: [
        ...devicePolicyDetailWith32RulesResponse.rules.slice(0, -2),
        {
          name: 'Block Xbox',
          action: 'BLOCK',
          deviceType: 'Gaming',
          osVendor: 'Xbox'
        }
      ]
    }

    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyDetailWith31RulesWithXboxResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe', requestId: 'requestId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'device2' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'device3' })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/rules \(31\)/i)

    // max = 31 for the case of Xbox in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    await deleteTheFirstRowOfRules()

    await screen.findByText(/rules \(30\)/i)

    // max = 31 for the case of Xbox in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await screen.findByText(/add rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please enter rule name/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await selectOptionSet('Gaming', 'PlayStation')

    await screen.findByRole('option', { name: 'PlayStation' })

    // not able to select PlayStation with 30 existing rules including Xbox
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/must reserve 2 additional rule slots for PlayStation and Xbox/i)).not.toBeNull()

    await userEvent.click(screen.getAllByText('Cancel')[1])

    await deleteTheFirstRowOfRules()

    await screen.findByText(/rules \(29\)/i)

    // max = 31 for the case of Xbox in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await screen.findByText(/add rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please enter rule name/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await selectOptionSet('Gaming', 'PlayStation')

    await screen.findByRole('option', { name: 'PlayStation' })

    // able to select PlayStation with 29 existing rules including Xbox

    // eslint-disable-next-line max-len
    expect(screen.queryByText(/must reserve 1 additional rule slot for PlayStation/i)).toBeNull()

    // eslint-disable-next-line max-len
    expect(screen.queryByText(/must reserve 2 additional rule slots for PlayStation and Xbox/i)).toBeNull()

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(30\)/i)

    // max = 30 for the case of both PlayStation and Xbox in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    await userEvent.click(screen.getAllByText('Cancel')[0])

    expect(await screen.findByText(/rules \(0\)/i)).toBeInTheDocument()
  })

  // eslint-disable-next-line max-len
  it.skip('Render DeviceOSComponent successfully with PlayStation in the existing rules', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    const devicePolicyDetailWith31RulesWithPlayStationResponse = {
      ...devicePolicyDetailWith32RulesResponse,
      rules: [
        ...devicePolicyDetailWith32RulesResponse.rules.slice(0, -2),
        {
          name: 'Block PlayStation',
          action: 'BLOCK',
          deviceType: 'Gaming',
          osVendor: 'PlayStation'
        }
      ]
    }

    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyDetailWith31RulesWithPlayStationResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe', requestId: 'requestId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'device2' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'device3' })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/rules \(31\)/i)

    // max = 31 for the case of PlayStation in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    await deleteTheFirstRowOfRules()

    await screen.findByText(/rules \(30\)/i)

    // max = 31 for the case of PlayStation in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await screen.findByText(/add rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please enter rule name/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await selectOptionSet('Gaming', 'Xbox')

    await screen.findByRole('option', { name: 'Xbox' })

    // not able to select Xbox with 30 existing rules including PlayStation
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/must reserve 2 additional rule slots for PlayStation and Xbox/i)).not.toBeNull()

    await userEvent.click(screen.getAllByText('Cancel')[1])

    await deleteTheFirstRowOfRules()

    await screen.findByText(/rules \(29\)/i)

    // max = 31 for the case of PlayStation in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).not.toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await screen.findByText(/add rule/i)

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/please enter rule name/i)

    await userEvent.type(await screen.findByRole('textbox', {
      name: /rule name/i
    }), 'rule1')

    await selectOptionSet('Gaming', 'Xbox')

    await screen.findByRole('option', { name: 'Xbox' })

    // able to select Xbox with 29 existing rules including PlayStation

    // eslint-disable-next-line max-len
    expect(screen.queryByText(/must reserve 1 additional rule slot for Xbox/i)).toBeNull()

    // eslint-disable-next-line max-len
    expect(screen.queryByText(/must reserve 2 additional rule slots for PlayStation and Xbox/i)).toBeNull()

    await userEvent.click(screen.getAllByText('Save')[1])

    await screen.findByText(/rules \(30\)/i)

    // max = 30 for the case of both PlayStation and Xbox in the existing rules
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()

    await userEvent.click(screen.getAllByText('Cancel')[0])

    expect(await screen.findByText(/rules \(0\)/i)).toBeInTheDocument()
  })

  it('Render DeviceOSComponent in viewMode successfully', async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.getEnhancedDevicePolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))
      ),
      rest.get(
        AccessControlUrls.getDevicePolicyList.url,
        (_, res, ctx) => res(
          ctx.json(queryDevice)
        )
      ), rest.get(
        AccessControlUrls.getDevicePolicy.url,
        (_, res, ctx) => res(
          ctx.json(devicePolicyDetailResponse)
        )
      ))

    render(
      <Provider>
        <Form>
          <DeviceOSComponent />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: '6de6a5239a1441cfb9c7fde93aa613fe', requestId: 'requestId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'dev2-block' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'device-1' })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/rules \(2\)/i)

    await userEvent.click(screen.getAllByText('Cancel')[0])

    expect(await screen.findByText('Rules (0)')).toBeInTheDocument()
  })

  it('Render DeviceOSComponent in componentMode successfully', async () => {
    render(
      <Provider>
        <Form>
          <DeviceOSComponent editMode={{ isEdit: false, id: '' }} isComponentMode={true}/>
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
