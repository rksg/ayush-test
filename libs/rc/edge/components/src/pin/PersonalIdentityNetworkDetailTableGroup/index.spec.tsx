import userEvent from '@testing-library/user-event'

import { useIdentityListQuery } from '@acx-ui/cloudpath/components'
import { useApListQuery }       from '@acx-ui/rc/services'
import {
  EdgePinFixtures,
  useTableQuery,
  PersonalIdentityNetworks,
  Persona,
  TableQuery
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { render, renderHook, screen } from '@acx-ui/test-utils'



import { defaultApPayload } from './ApsTable'

import { PersonalIdentityNetworkDetailTableGroup } from '.'
const { mockPinData } = EdgePinFixtures

jest.mock('@acx-ui/rc/services', () => ({
  useApListQuery: jest.fn().mockReturnValue({
    data: { totalCount: 2 }
  })
}))
jest.mock('@acx-ui/cloudpath/components', () => ({
  useIdentityListQuery: jest.fn().mockReturnValue({
    data: {}
  })
}))
jest.mock('./ApsTable', () => ({
  ApsTable: () => <div data-testid='ApsTable' />
}))
jest.mock('./AssignedSegmentsTable', () => ({
  AssignedSegmentsTable: () => <div data-testid='AssignedSegmentsTable' />
}))
jest.mock('./DistSwitchesTable', () => ({
  DistSwitchesTable: () => <div data-testid='DistSwitchesTable' />
}))
jest.mock('./AccessSwitchTable', () => ({
  AccessSwitchTable: () => <div data-testid='AccessSwitchTable' />
}))
jest.mock('./NetworksTable', () => ({
  NetworksTable: () => <div data-testid='NetworksTable' />
}))

describe('PersonalIdentityNetwork DetailTableGroup', () => {
  const { result: apTableQueryResult } = renderHook(
    () => useTableQuery({
      useQuery: useApListQuery,
      defaultPayload: {
        ...defaultApPayload,
        filters: { venueId: [''] }
      }
    }),
    { wrapper: ({ children }) => <Provider children={children} /> })

  const { result: personaTableQueryResult } = renderHook(
    () => useIdentityListQuery({
      personaGroupId: 'mock-persona-group-id'
    }),
    { wrapper: ({ children }) => <Provider children={children} /> })


  it('should display loader when isLoading is true', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkDetailTableGroup
          pinData={mockPinData as unknown as PersonalIdentityNetworks}
          apListTableQuery={apTableQueryResult.current}
          // eslint-disable-next-line max-len
          personaListTableQuery={personaTableQueryResult.current as TableQuery<Persona, { keyword: string, groupId: string }, unknown>}
          isLoading
        />
      </Provider>
    )

    screen.getByRole('img', { name: 'loader' })
  })

  it('Switch tab', async () => {
    render(
      <Provider>
        <PersonalIdentityNetworkDetailTableGroup
          pinData={mockPinData as unknown as PersonalIdentityNetworks}
          apListTableQuery={apTableQueryResult.current}
          // eslint-disable-next-line max-len
          personaListTableQuery={personaTableQueryResult.current as TableQuery<Persona, { keyword: string, groupId: string }, unknown>}
          isLoading={false}
        />
      </Provider>
    )

    await screen.findByTestId('NetworksTable')
    await userEvent.click(await screen.findByRole('tab', { name: /Aps/i }))
    await screen.findByTestId('ApsTable')
    await userEvent.click(await screen.findByRole('tab', { name: /Dist. Switches/i }))
    await screen.findByTestId('DistSwitchesTable')
    await userEvent.click(await screen.findByRole('tab', { name: /Access Switches/i }))
    await screen.findByTestId('AccessSwitchTable')
    await userEvent.click(await screen.findByRole('tab', { name: /Assigned Segments/i }))
    await screen.findByTestId('AssignedSegmentsTable')

    expect(screen.getByRole('tab', {
      name: /aps \(2\)/i
    })).toBeVisible()
  })
})
