import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { AccessControlUrls }          from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { devicePolicyListResponse } from '../../__tests__/fixtures'

import DeviceOSDrawer from './index'

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

const deviceDetail = {
  tenantId: '6de6a5239a1441cfb9c7fde93aa613fe',
  name: 'device1-another',
  defaultAccess: 'ALLOW',
  rules: [
    {
      name: 'vlan101',
      action: 'ALLOW',
      deviceType: 'Tablet',
      osVendor: 'Ios'
    },
    {
      name: 'rule_f',
      action: 'ALLOW',
      deviceType: 'Smartphone',
      osVendor: 'Ios',
      downloadRateLimit: 107.7,
      uploadRateLimit: 200,
      vlan: 12
    }
  ],
  id: 'fdd2bc421cb445daac8937dbb2366f5e'
}

const deviceResponse = {
  requestId: '508c529a-0bde-49e4-8179-19366f69f31f',
  response: {
    tenantId: '6de6a5239a1441cfb9c7fde93aa613fe',
    name: 'device1-another',
    defaultAccess: 'ALLOW',
    rules: [
      {
        name: 'vlan101',
        action: 'ALLOW',
        deviceType: 'Laptop',
        osVendor: 'All'
      },
      {
        name: 'rule_f',
        action: 'ALLOW',
        deviceType: 'Smartphone',
        osVendor: 'Ios',
        downloadRateLimit: 107.7,
        uploadRateLimit: 200,
        vlan: 12
      }
    ],
    id: '173f4a0aa7da4711804b065dcec2c6a4'
  }
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

const selectOptionSet = async (device: string, vendor: string) => {
  await screen.findByRole('option', { name: 'Select...' })

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[1],
    screen.getByRole('option', { name: device })
  )

  await screen.findByRole('option', { name: vendor })

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[2],
    screen.getByRole('option', { name: vendor })
  )
}

describe.skip('DeviceOSDrawer Component setting I', () => {
  beforeEach(async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyListResponse)
      )
    ))
  })

  it('Render DeviceOSDrawer component successfully with Smartphone & Ios', async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.addDevicePolicy.url,
        (_, res, ctx) => res(
          ctx.json(deviceResponse)
        )
      ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

    await userEvent.click(screen.getByText(/delete rule/i))
  })

  it('Render DeviceOSDrawer component successfully with Tablet & AmazonKindle', async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.addDevicePolicy.url,
        (_, res, ctx) => res(
          ctx.json(deviceResponse)
        )
      ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

  it('Render DeviceOSDrawer component successfully with Voip & CiscoIpPhone', async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.addDevicePolicy.url,
        (_, res, ctx) => res(
          ctx.json(deviceResponse)
        )
      ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

describe('DeviceOSDrawer Component setting II', () => {
  beforeEach(async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyListResponse)
      )
    ))
  })

  it('Render DeviceOSDrawer component successfully with Gaming & XBOX360', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(queryDeviceUpdate)
      )
    ), rest.post(
      AccessControlUrls.addDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(deviceResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

  it('Render DeviceOSDrawer component successfully without Gaming & PlayStation', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.post(
      AccessControlUrls.addDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(deviceResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

    await screen.findByText(/please select the deviceType option/i)

    await screen.findByText(/please select the osVendor option/i)

    await screen.findByRole('option', { name: 'Select...' })

    await userEvent.selectOptions(
      screen.getAllByRole('combobox')[1],
      screen.getByRole('option', { name: 'Gaming' })
    )

    await screen.findByRole('option', { name: 'All' })

    expect(screen.queryByRole('option', { name: 'PlayStation' })).toBeNull()

  })

  it.skip('Render DeviceOSDrawer component successfully with Gaming & PlayStation', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.post(
      AccessControlUrls.addDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(deviceResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

    await screen.findByText(/please select the deviceType option/i)

    await screen.findByText(/please select the osVendor option/i)

    await selectOptionSet('Gaming', 'PlayStation')

    expect(screen.queryByText(/please select the deviceType option/i)).toBeNull()

    expect(screen.queryByText(/please select the osVendor option/i)).toBeNull()

  })

  it('Render DeviceOSDrawer component successfully with Printer & HpPrinter', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.post(
      AccessControlUrls.addDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(deviceResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

  it('Render DeviceOSDrawer component successfully with IotDevice & NextCamera', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.post(
      AccessControlUrls.addDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(deviceResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

describe('DeviceOSDrawer Component setting III', () => {
  beforeEach(async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyListResponse)
      )
    ))
  })

  it('Render DeviceOSDrawer component successfully with HomeAvEquipment & SonyPlayer', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.post(
      AccessControlUrls.addDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(deviceResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

  it('Render DeviceOSDrawer component successfully with WdsDevice & TelenetCpe', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.post(
      AccessControlUrls.addDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(deviceResponse)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

describe('DeviceOSDrawer Component', () => {
  beforeEach(async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(devicePolicyListResponse)
      )
    ))
  })

  it('Render DeviceOSDrawer component successfully', async () => {
    mockServer.use(
      rest.post(
        AccessControlUrls.addDevicePolicy.url,
        (_, res, ctx) => res(
          ctx.json(deviceResponse)
        )
      ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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

    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryDeviceUpdate)
      )
    ))

    expect(await screen.findByRole('option', { name: 'device1-another' })).toBeInTheDocument()
  })

  it('Render DeviceDrawer component in viewMode successfully', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getDevicePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryDevice)
      )
    ), rest.get(
      AccessControlUrls.getDevicePolicy.url,
      (_, res, ctx) => res(
        ctx.json(deviceDetail)
      )
    ))

    render(
      <Provider>
        <Form>
          <DeviceOSDrawer />
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
      screen.getByRole('option', { name: 'device1' })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/rules \(2\)/i)

    await userEvent.click(screen.getAllByText('Cancel')[0])

    expect(await screen.findByText('Rules (0)')).toBeInTheDocument()
  })
})
