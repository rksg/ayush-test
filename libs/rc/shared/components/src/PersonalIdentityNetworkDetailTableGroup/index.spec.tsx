import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, nsgApi, personaApi }                             from '@acx-ui/rc/services'
import { CommonUrlsInfo, NetworkSegmentationUrls, PersonaUrls }  from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockedApList,
  mockedNsgData,
  mockedNsgStatsList,
  mockedNsgSwitchInfoData,
  mockedPersonaList,
  replacePagination } from './__tests__/fixtures'

import { PersonalIdentityNetworkDetailTableGroup } from '.'

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

describe('NetworkSegmentationDetailTableGroup', () => {

  beforeEach(() => {
    store.dispatch(nsgApi.util.resetApiState())
    store.dispatch(personaApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getNetworkSegmentationGroupById.url,
        (req, res, ctx) => res(ctx.json(mockedNsgData))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockedNsgStatsList))
      ),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(mockedApList))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => res(ctx.json(mockedPersonaList))
      ),
      rest.get(
        NetworkSegmentationUrls.getSwitchInfoByNSGId.url,
        (req, res, ctx) => res(ctx.json(mockedNsgSwitchInfoData))
      )
    )
  })

  it('Switch tab', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkDetailTableGroup nsgId='test' />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByTestId('ApsTable')
    await user.click(await screen.findByRole('tab', { name: /Dist. Switches/i }))
    await screen.findByTestId('DistSwitchesTable')
    await user.click(await screen.findByRole('tab', { name: /Access Switches/i }))
    await screen.findByTestId('AccessSwitchTable')
    await user.click(await screen.findByRole('tab', { name: /Assigned Segments/i }))
    await screen.findByTestId('AssignedSegmentsTable')

    expect(screen.getByRole('tab', {
      name: /aps \(2\)/i
    })).toBeVisible()
  })
})
