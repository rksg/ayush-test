import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, pinApi, personaApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EdgePinFixtures,
  EdgeGeneralFixtures,
  EdgePinUrls,
  EdgeUrlsInfo,
  PersonaUrls,
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  mockedApList,
  mockedPersonaList,
  replacePagination } from './__tests__/fixtures'

import { PersonalIdentityNetworkDetailTableGroup } from '.'
const { mockPinData, mockPinStatsList, mockPinSwitchInfoData } = EdgePinFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

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

describe('PersonalIdentityNetwork DetailTableGroup', () => {

  beforeEach(() => {
    store.dispatch(pinApi.util.resetApiState())
    store.dispatch(personaApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(
        EdgePinUrls.getEdgePinById.url,
        (_req, res, ctx) => res(ctx.json(mockPinData))),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_req, res, ctx) => res(ctx.json({}))),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (_req, res, ctx) => res(ctx.json({}))),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockPinStatsList))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_req, res, ctx) => res(ctx.json(mockedApList))),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (_req, res, ctx) => res(ctx.json(mockedPersonaList))),
      rest.get(
        EdgePinUrls.getSwitchInfoByPinId.url,
        (_req, res, ctx) => res(ctx.json(mockPinSwitchInfoData))),
      rest.post(
        PersonaUrls.searchIdentityClients.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('Switch tab', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <PersonalIdentityNetworkDetailTableGroup pinId='test' />
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
