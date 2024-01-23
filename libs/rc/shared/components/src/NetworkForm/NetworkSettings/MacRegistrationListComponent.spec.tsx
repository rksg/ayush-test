import React from 'react'

import { userEvent } from '@storybook/testing-library'
import { Form }      from 'antd'
import { rest }      from 'msw'

import { useIsSplitOn, useIsTierAllowed }              from '@acx-ui/feature-toggle'
import { MacRegListUrlsInfo, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen }                  from '@acx-ui/test-utils'

import {
  mockMacRegistrationPoolList, mockPolicySetList
} from '../__tests__/fixtures'

import MacRegistrationListComponent from './MacRegistrationListComponent'

jest.mock('../../policies/MacRegistrationListForm', () => ({
  ...jest.requireActual('../../policies/MacRegistrationListForm'),
  MacRegistrationListForm: () => <div data-testid='MacRegistrationListForm'>
    MacRegistrationListFormTest
  </div>
}))

jest.mock('../../useEdgeActions', () => ({
  ...jest.requireActual('../../useEdgeActions'),
  useSdLanScopedNetworkVenues: jest.fn().mockReturnValue([])
}))

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  useNetworkVxLanTunnelProfileInfo: jest.fn().mockReturnValue({
    enableTunnel: false,
    enableVxLan: false,
    vxLanTunnels: undefined
  })
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange }: MockSelectProps) => {
    return (
      <select onChange={(e) => onChange?.(e.target.value)} value=''>
        {children ? children : null}
      </select>
    )
  }
  Select.Option = 'option'
  return { ...components, Select }
})

describe('MacRegistrationListComponent', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    mockServer.use(
      rest.get(MacRegListUrlsInfo.getMacRegistrationPools.url
        .split('?')[0],
      (_, res, ctx) => res(ctx.json(mockMacRegistrationPoolList))),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockPolicySetList))
      )
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

  it('should render MacRegistrationListComponent successfully', async () => {
    render(<Provider>
      <Form>
        <MacRegistrationListComponent inputName={['wlan']} />
      </Form>
    </Provider>, { route: { params } })

    await screen.findByText(/Select MAC Registration List/i)
    await screen.findByText(/macreg1/i)

    await userEvent.click(screen.getByText('Add'))

    await screen.findByText(/add mac registration list/i)
    expect(screen.getByText(/add mac registration list/i)).toBeVisible()
    expect(await screen.findByText(/MacRegistrationListFormTest/i)).toBeVisible()
  })
})
