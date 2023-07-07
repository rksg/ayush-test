import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { AccessControlUrls }          from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { layer3PolicyListResponse } from '../__tests__/fixtures'

import Layer3Drawer from './Layer3Drawer'

const queryLayer3 = [
  {
    id: '233d3182a1aa49ee9f50aeb039347021',
    name: 'l3-010',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: 'ee2a78cf7a7a4c76bdfab65bd2597984',
    name: 'l3-011',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '8aa4a081711e492eb05a70f9f9ba253a',
    name: 'l3-1',
    rulesCount: 1,
    networksCount: 0
  },
  {
    id: '418d7c562aed428083587fe74aaf11f1',
    name: 'l3-profile1',
    rulesCount: 2,
    networksCount: 0
  },
  {
    id: '6f400428632044168215b5eaff3a0f71',
    name: 'l3-profile2',
    rulesCount: 2,
    networksCount: 0
  },
  {
    id: '1ae26f6f061d4f8aa86234d100b4d6d1',
    name: 'layer3',
    rulesCount: 1,
    networksCount: 0
  }
]

const queryLayer3Update = [
  ...queryLayer3,
  {
    id: '6ab1a781711e492eb05a70f9f9ba253a',
    name: 'layer3-test',
    rulesCount: 1,
    networksCount: 0
  }
]

const layer3Detail = {
  name: 'l3-010',
  defaultAccess: 'ALLOW',
  l3Rules: [
    {
      priority: 1,
      access: 'ALLOW',
      source: {
        enableIpSubnet: false
      },
      destination: {
        enableIpSubnet: false
      },
      id: '96b80fe415fe4131addbb1a6e967167d'
    }
  ],
  id: '233d3182a1aa49ee9f50aeb039347021'
}

const layer3Response = {
  requestId: '508c529a-0bde-49e4-8179-19366f69f31f'
}

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) =>
    <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

const anyIpSetting = async () => {
  await userEvent.click(screen.getByRole('button', {
    name: 'Add'
  }))

  await screen.findByText(/add layer 3 rule/i)

  await userEvent.click(screen.getAllByText('Save')[1])

  await screen.findAllByText('IP: Any')

  await screen.findAllByRole('cell', {
    name: /any protocol/i
  })
}

const ipSetting = async () => {
  await userEvent.click(screen.getByRole('button', {
    name: 'Add'
  }))

  await screen.findByText(/add layer 3 rule/i)

  await userEvent.type(screen.getByRole('textbox', {
    name: 'Description'
  }), 'layer3-test-desc-ip')

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[1],
    screen.getByRole('option', { name: 'UDP' })
  )

  await userEvent.click(
    screen.getAllByText('IP Address')[0]
  )

  await screen.findByPlaceholderText('Source Ip')

  await userEvent.type(screen.getByPlaceholderText('Source Ip'),
    '1.1.1.1')

  await userEvent.click(
    screen.getAllByText('IP Address')[1]
  )

  await screen.findByPlaceholderText('Destination Ip')

  await userEvent.type(screen.getByPlaceholderText('Destination Ip'),
    '10.10.10.10')

  await userEvent.click(
    screen.getAllByText('Any IP Address')[1]
  )

  await userEvent.click(screen.getAllByText('Save')[1])

  await screen.findByRole('cell', {
    name: /udp/i
  })
}

const subnetSetting = async () => {
  await userEvent.click(screen.getByRole('button', {
    name: 'Add'
  }))

  await screen.findByText(/add layer 3 rule/i)

  await userEvent.type(screen.getByRole('textbox', {
    name: 'Description'
  }), 'layer3-test-desc-subnet')

  await userEvent.selectOptions(
    screen.getAllByRole('combobox')[1],
    screen.getByRole('option', { name: 'TCP' })
  )

  await userEvent.click(
    screen.getAllByText('Subnet Network Address')[0]
  )

  await screen.findByPlaceholderText('Source Network Address')

  await userEvent.type(screen.getByPlaceholderText('Source Network Address'),
    '1.2.3.4')

  await userEvent.type(screen.getByPlaceholderText('Source Mask'),
    '255.255.0.0')

  await userEvent.click(screen.getAllByText('Save')[1])

  await screen.findByRole('cell', {
    name: /tcp/i
  })
}

describe.skip('Layer3Drawer Component', () => {
  it('Render Layer3Drawer component with anyIp option successfully', async () => {
    mockServer.use(
      rest.post(AccessControlUrls.addL3AclPolicy.url,
        (_, res, ctx) => res(ctx.json(layer3Response))),
      rest.get(AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(layer3PolicyListResponse)))
    )

    render(
      <Provider>
        <Form>
          <Layer3Drawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/layer 3 settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'layer3-test')

    await anyIpSetting()

    await userEvent.click(screen.getAllByText('Save')[0])

    mockServer.use(rest.get(
      AccessControlUrls.getL3AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryLayer3Update)
      )
    ),
    rest.get(AccessControlUrls.getL3AclPolicyList.url,
      (_, res, ctx) => res(ctx.json(layer3PolicyListResponse)))
    )

    await screen.findByRole('option', { name: 'layer3-test' })

  })

  it('Render Layer3Drawer component with ip option successfully', async () => {
    mockServer.use(rest.post(
      AccessControlUrls.addL3AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer3Response)
      )
    ),
    rest.get(AccessControlUrls.getL3AclPolicyList.url,
      (_, res, ctx) => res(ctx.json(layer3PolicyListResponse)))
    )

    render(
      <Provider>
        <Form>
          <Layer3Drawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/layer 3 settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'layer3-test')

    await ipSetting()

  })

  it('Render Layer3Drawer component with subnet option successfully', async () => {
    mockServer.use(rest.post(
      AccessControlUrls.addL3AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer3Response)
      )
    ),
    rest.get(AccessControlUrls.getL3AclPolicyList.url,
      (_, res, ctx) => res(ctx.json(layer3PolicyListResponse)))
    )

    render(
      <Provider>
        <Form>
          <Layer3Drawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    await screen.findByText(/layer 3 settings/i)

    await userEvent.click(screen.getByText(/block traffic/i))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'layer3-test')

    await anyIpSetting()
    await subnetSetting()

    await userEvent.click(screen.getByText('IP: 1.2.3.4/255.255.0.0'))

    await userEvent.click(screen.getByRole('button', {
      name: 'Edit'
    }))

    await userEvent.click(screen.getAllByText('Cancel')[1])

    await userEvent.click(screen.getByText('IP: 1.2.3.4/255.255.0.0'))

    await userEvent.click(screen.getByRole('button', {
      name: 'Edit'
    }))

    await screen.findByText(/edit layer 3 rule/i)

    await userEvent.type(screen.getByRole('textbox', {
      name: /description/i
    }), '-ruleDescription')

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.click(await screen.findByText('layer3-test-desc-subnet-ruleDescription'))

    await userEvent.click(screen.getByRole('button', {
      name: /delete/i
    }))

    await screen.findByText(/delete rule/i)

    await userEvent.click(screen.getByRole('button', {
      name: /delete rule/i
    }))

    await userEvent.click(screen.getAllByText('Save')[0])

    mockServer.use(rest.get(
      AccessControlUrls.getL3AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryLayer3Update)
      )
    ))

    await screen.findByRole('option', { name: 'layer3-test' })

  })

  it('Render Layer3Drawer component in viewMode successfully', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getL3AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryLayer3)
      )
    ), rest.get(
      AccessControlUrls.getL3AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer3Detail)
      )
    ))

    render(
      <Provider>
        <Form>
          <Layer3Drawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', requestId: 'requestId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'l3-010' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'l3-010' })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/layer 3 rules \(1\)/i)
  })
})
