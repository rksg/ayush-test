import '@testing-library/jest-dom'

import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { AccessControlUrls, PoliciesConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { baseConfigTemplateApi, Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen, within }                from '@acx-ui/test-utils'

import { enhancedLayer3PolicyListResponse } from '../AccessControl/__tests__/fixtures'

import { layer3PolicyListResponse } from './__tests__/fixtures'
import { Layer3Component }          from './Layer3Component'

const queryLayer3 = [
  {
    id: '233d3182a1aa49ee9f50aeb039347021',
    name: 'l3-010',
    description: 'des',
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

jest.mock('./ComponentModeForm', () => {
  return {
    ComponentModeForm: () => <div data-testid='component-mode-form'/>
  }
})

const findDrawer = async (label: string) => {
  return await screen.findByRole('dialog', {
    name: (_, el) => el
      .textContent!
      .toLowerCase()
      .includes(label)
  })
}

const anyIpSetting = async () => {
  await userEvent.click(screen.getByRole('button', {
    name: 'Add'
  }))

  const drawer = within(await findDrawer('add layer 3 rule'))

  await userEvent.click(drawer.getByText('Save'))

  await screen.findAllByText('IP: Any')

  await screen.findAllByRole('cell', {
    name: /any protocol/i
  })
}

const ipSetting = async () => {
  await userEvent.click(screen.getByRole('button', {
    name: 'Add'
  }))

  const drawer = within(await findDrawer('add layer 3 rule'))

  await userEvent.type(drawer.getByRole('textbox', {
    name: 'Description'
  }), 'layer3-test-desc-ip')

  await userEvent.selectOptions(
    drawer.getByRole('combobox'),
    drawer.getByRole('option', { name: 'UDP' })
  )

  await userEvent.click(
    drawer.getAllByText('IP Address')[0]
  )

  await drawer.findByPlaceholderText('Source Ip')

  await userEvent.type(drawer.getByPlaceholderText('Source Ip'),
    '1.1.1.1')

  await userEvent.click(
    drawer.getAllByText('IP Address')[1]
  )

  await drawer.findByPlaceholderText('Destination Ip')

  await userEvent.type(drawer.getByPlaceholderText('Destination Ip'),
    '10.10.10.10')

  await userEvent.click(
    drawer.getAllByText('Any IP Address')[1]
  )

  await userEvent.click(drawer.getByText('Save'))

  await screen.findByRole('cell', {
    name: /udp/i
  })
}

const subnetSetting = async () => {
  await userEvent.click(screen.getByRole('button', {
    name: 'Add'
  }))

  const drawer = within(await findDrawer('add layer 3 rule'))

  await userEvent.type(
    drawer.getByPlaceholderText(/short description/),
    'layer3-test-desc-subnet'
  )

  await userEvent.selectOptions(
    drawer.getByRole('combobox'),
    drawer.getByRole('option', { name: 'TCP' })
  )

  await userEvent.click(
    drawer.getAllByText('Subnet Network Address')[0]
  )

  await drawer.findByPlaceholderText('Source Network Address')

  await userEvent.type(drawer.getByPlaceholderText('Source Network Address'),
    '1.2.3.4')

  await userEvent.type(drawer.getByPlaceholderText('Source Mask'),
    '255.255.0.0')

  await userEvent.click(drawer.getByText('Save'))

  await screen.findByRole('cell', {
    name: /tcp/i
  })
}

const layer3Data = enhancedLayer3PolicyListResponse.data

describe('Layer3Component', () => {
  const mockAddL3AclPolicy = jest.fn()
  beforeEach(() => {
    store.dispatch(baseConfigTemplateApi.util.resetApiState())
    mockServer.use(
      rest.post(AccessControlUrls.getEnhancedL3AclPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedLayer3PolicyListResponse))),
      rest.post(AccessControlUrls.addL3AclPolicy.url,
        (_, res, ctx) => {
          mockAddL3AclPolicy()
          return res(ctx.json(layer3Response))
        }),
      rest.post(PoliciesConfigTemplateUrlsInfo.getEnhancedL3AclPolicies.url,
        (req, res, ctx) => res(ctx.json(enhancedLayer3PolicyListResponse))),
      rest.get(AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(layer3PolicyListResponse)))
    )
  })

  it('Render Layer3Component with anyIp option successfully', async () => {
    render(
      <Provider>
        <Form>
          <Layer3Component />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    const drawer = within(await findDrawer('layer 3 settings'))

    await userEvent.click(drawer.getByText(/block traffic/i))

    const newLayer3Policy = {
      id: 'newLayer3PolicyId',
      name: 'newLayer3PolicyName'
    }

    await userEvent.type(drawer.getByRole('textbox', {
      name: /policy name:/i
    }), newLayer3Policy.name)

    await anyIpSetting()

    mockServer.use(
      rest.post(AccessControlUrls.getEnhancedL3AclPolicies.url,
        (req, res, ctx) => res(ctx.json({
          ...enhancedLayer3PolicyListResponse,
          data: [
            ...layer3Data,
            newLayer3Policy
          ]
        })))
    )

    await userEvent.click(drawer.getByText('Save'))

    expect(await screen.findByRole('option', { name: newLayer3Policy.name })).toBeVisible()
  })

  it.skip('Render Layer3Component with ip option successfully', async () => {
    render(
      <Provider>
        <Form>
          <Layer3Component />
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

  it('Render Layer3Component with subnet option and save successfully', async () => {
    render(
      <Provider>
        <Form>
          <Layer3Component />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    const mainDrawer = within(await findDrawer('layer 3 settings'))

    await userEvent.click(mainDrawer.getByText(/block traffic/i))

    await userEvent.type(mainDrawer.getByRole('textbox', {
      name: /policy name:/i
    }), 'layer3-test')

    await anyIpSetting()
    await subnetSetting()

    expect(await mainDrawer.findByText('layer3-test-desc-subnet')).toBeVisible()

    await userEvent.click(mainDrawer.getByText('IP: 1.2.3.4/255.255.0.0'))
    await userEvent.click(mainDrawer.getByRole('button', { name: 'Edit' }))
    let drawer = within(await findDrawer('edit layer 3 rule'))
    await userEvent.click(drawer.getAllByText('Cancel')[1])

    await userEvent.click(mainDrawer.getByText('IP: 1.2.3.4/255.255.0.0'))
    await userEvent.click(mainDrawer.getByRole('button', { name: 'Edit' }))
    drawer = within(await findDrawer('edit layer 3 rule'))
    await userEvent.click(drawer.getByText('Save'))

    mockServer.use(
      rest.get(
        AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(
          ctx.json(queryLayer3Update)
        )),
      rest.post(
        AccessControlUrls.getEnhancedL3AclPolicies.url,
        (req, res, ctx) => res(ctx.json(
          {
            ...enhancedLayer3PolicyListResponse,
            data: [
              ...enhancedLayer3PolicyListResponse.data,
              {
                id: '4279f73355044b8fa54e0e738188dc6e',
                name: 'layer3-test',
                networkIds: []
              }
            ]
          }))
      )
    )
    await userEvent.click(mainDrawer.getByText('Save'))

    expect(mockAddL3AclPolicy).toHaveBeenCalled()

    expect(await screen.findByRole('option', { name: 'layer3-test' })).toBeInTheDocument()
  })

  it('Render Layer3Component with subnet option and edit successfully', async () => {
    render(
      <Provider>
        <Form>
          <Layer3Component />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText('Add New'))

    const mainDrawer = within(await findDrawer('layer 3 settings'))

    await userEvent.click(mainDrawer.getByText(/block traffic/i))

    await userEvent.type(mainDrawer.getByRole('textbox', {
      name: /policy name:/i
    }), 'layer3-test')

    await subnetSetting()

    await userEvent.click(mainDrawer.getByText('IP: 1.2.3.4/255.255.0.0'))
    await userEvent.click(mainDrawer.getByRole('button', { name: 'Edit' }))
    const drawer = within(await findDrawer('edit layer 3 rule'))
    await userEvent.type(drawer.getByPlaceholderText(/short description/), '-ruleDescription')
    await userEvent.click(drawer.getByText('Save'))

    expect(await mainDrawer.findByText('layer3-test-desc-subnet-ruleDescription')).toBeVisible()
  })

  it('Render Layer3Component in viewMode successfully', async () => {
    mockServer.use(rest.get(
      AccessControlUrls.getL3AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer3Detail)
      )
    ))

    render(
      <Provider>
        <Form>
          <Layer3Component />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', requestId: 'requestId1' }
        }
      }
    )

    await screen.findByRole('option', { name: layer3Data[0].name })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: layer3Data[0].name })
    )

    await userEvent.click(screen.getByText(/edit details/i))

    await screen.findByText(/layer 3 rules \(1\)/i)
  })

  it('Render Layer3Component component in componentMode successfully', async () => {
    render(
      <Provider>
        <Form>
          <Layer3Component editMode={{ isEdit: false, id: '' }} isComponentMode={true}/>
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
