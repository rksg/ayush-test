import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  PersonaUrls,
  MacRegListUrlsInfo,
  DpskUrls,
  CommonUrlsInfo,
  EdgePinUrls,
  PropertyUrlsInfo,
  DistributionSwitch,
  AccessSwitch,
  CertificateUrls,
  EdgePinFixtures
} from '@acx-ui/rc/utils'
import { Provider }            from '@acx-ui/store'
import {
  fireEvent,
  within,
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  mockDpskList,
  mockDpskPool,
  mockMacRegistration,
  mockMacRegistrationList,
  mockPersonaGroupTableResult,
  replacePagination
} from '../__tests__/fixtures'

import { PersonaGroupTable } from '.'

const { mockPinData } = EdgePinFixtures

const mockPropertyConfigOptionsResult = { content: [
  { venueId: 'venue-id', venueName: 'venue-name' }
] }

const mockPinSwitchInfoData: {
  distributionSwitches: DistributionSwitch[],
  accessSwitches: AccessSwitch[]
} = {
  distributionSwitches: [{
    id: 'c8:03:f5:3a:95:c6',
    siteIp: '10.206.78.150',
    vlans: '23',
    siteKeepAlive: '5',
    siteRetry: '3',
    loopbackInterfaceId: '12',
    loopbackInterfaceIp: '1.2.3.4',
    loopbackInterfaceSubnetMask: '255.255.255.0',
    forwardingProfile: '2',
    siteConnection: 'Disconnected',
    siteActive: '10.206.78.150',
    dispatchMessage: '[SUCCESS]',
    model: 'ICX7550-48P',
    name: 'FMN4221R00H---DS---3',
    familyId: 'ICX7550',
    firmwareVersion: 'GZR09010f_b40.bin'
  }],
  accessSwitches: [{
    id: 'c0:c5:20:aa:35:fd',
    vlanId: 111,
    webAuthPageType: 'TEMPLATE',
    templateId: '723250a97f3a4c3780e70c83c5b095ba',
    webAuthPasswordLabel: 'password-Ken-0209',
    webAuthCustomTitle: 'title-Ken-0209',
    webAuthCustomTop: 'top-Ken-0209',
    webAuthCustomLoginButton: 'login-Ken-0209',
    webAuthCustomBottom: 'bottom-Ken-0209',
    uplinkInfo: {
      uplinkType: 'PORT',
      uplinkId: '1/1/1'
    },
    distributionSwitchId: 'c8:03:f5:3a:95:c6',
    dispatchMessage: '[SUCCESS]',
    model: 'ICX7150-C12P',
    name: 'FEK3224R09N---AS---3',
    familyId: 'ICX7150',
    firmwareVersion: 'SPR09010f_b32.bin'
  }]
}

// To enable PIN PLM FF and allow to call api
jest.mocked(useIsSplitOn).mockReturnValue(true)
jest.mocked(useIsTierAllowed).mockReturnValue(true)

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  PersonaGroupDrawer: () => <div>PersonaGroupDrawer</div>
}))

const services = require('@acx-ui/rc/services')

describe('Persona Group Table', () => {
  let params: { tenantId: string }
  const searchPersonaGroupApi = jest.fn()

  beforeEach(async () => {
    searchPersonaGroupApi.mockClear()

    services.useLazyGetEdgePinByIdQuery = jest.fn().mockReturnValue([() => {
      return Promise.resolve({ data: mockPinData })
    }])

    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.searchPersonaGroupList.url),
        (req, res, ctx) => {
          searchPersonaGroupApi()
          return res(ctx.json(mockPersonaGroupTableResult))
        }
      ),
      rest.delete(
        PersonaUrls.deletePersonaGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistration))
      ),
      rest.post(
        replacePagination(MacRegListUrlsInfo.searchMacRegistrationPools.url),
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpskPool))
      ),
      rest.post(
        DpskUrls.getEnhancedDpskList.url,
        (req, res, ctx) => res(ctx.json(mockDpskList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json( { data: [] }))
      ),
      rest.get(
        EdgePinUrls.getSwitchInfoByPinId.url,
        (req, res, ctx) => res(ctx.json(mockPinSwitchInfoData))
      ),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        // just for filterable options generation
        (req, res, ctx) => res(ctx.json({ data: [{ id: 'nsg-id-1', name: 'nsg-name-1' }] }))
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyConfigsQuery.url,
        (_, res, ctx) => res(ctx.json(mockPropertyConfigOptionsResult))
      ),
      rest.post(
        CertificateUrls.getCertificateTemplates.url,
        (_, res, ctx) => {
          return res(ctx.json({ data: [] }))
        }
      ),
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (_, res, ctx) => res(ctx.json({ id: 'cert-template-1', name: 'cert-template-name' }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it.skip('should render table', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group' }
      })
    await waitFor(() => expect(searchPersonaGroupApi).toHaveBeenCalledTimes(1))

    const targetPersonaGroup = mockPersonaGroupTableResult.content[0]
    const macLinkName = mockMacRegistrationList.content
      .find(pool => pool.id === targetPersonaGroup.macRegistrationPoolId)?.name

    // assert link in Table view
    await screen.findByRole('link', { name: targetPersonaGroup.name })
    await screen.findAllByRole('link', { name: macLinkName })
    await screen.findAllByRole('link', { name: /cert-template-name/i })

    // change search bar and trigger re-fetching mechanism
    const searchBar = await screen.findByRole('textbox')
    await userEvent.type(searchBar, 'search text')

    // first: table query + second: search bar changed query
    await waitFor(() => expect(searchPersonaGroupApi).toHaveBeenCalledTimes(2))
  })

  it.skip('should delete selected persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group' }
      })

    //   80 |       70 |   66.66 |   80.95
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const personaGroupName = mockPersonaGroupTableResult.content[2].name
    const row = await screen.findByRole('row', { name: new RegExp(personaGroupName) })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText(`Delete "${personaGroupName}"?`)
    const deletePersonaGroupButton = await screen.findByText('Delete Identity Group')
    fireEvent.click(deletePersonaGroupButton)
  })

  it.skip('should edit selected persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /Class A/i })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)

    // TODO: assert edit data props into drawer
    // const nameDisplay = screen.getByLabelText(/Persona Group Name/i) as HTMLInputElement
    // expect(nameDisplay.value).toBe(/Class A/i)
  })

  it.skip('should create persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group' }
      })

    const createButton = await screen.findByRole('button', { name: /Add Identity Group/i })
    fireEvent.click(createButton)

    await screen.findByText('Create Identity Group')

    // const addPersonaGroupButton = await screen.findAllByRole('button', { name: /Add/i })
    // fireEvent.click(addPersonaGroupButton)
    // TODO: assert drawer without data

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

  })

  it.skip('should export persona group to CSV', async () => {
    const exportFn = jest.fn()

    mockServer.use(
      rest.post(
        replacePagination(PersonaUrls.exportPersonaGroup.url
          .replace('&timezone=:timezone&date-format=:dateFormat', '')),
        (req, res, ctx) => {
          const headers = req.headers['headers']

          // Get List API: 'Content-Type': 'application/json'
          if (headers['accept'] === 'application/json') {
            return res(ctx.json(mockPersonaGroupTableResult))
          } else {
            exportFn()

            return res(ctx.set({
              'content-disposition': 'attachment; filename=IdentityGroups_20230118100829.csv',
              'content-type': 'text/csv;charset=ISO-8859-1'
            }), ctx.text('IdentityGroup'))
          }
        })
    )

    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>,{
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await userEvent.click(await screen.findByTestId('export-persona-group'))

    await waitFor(() => expect(exportFn).toHaveBeenCalled())
  })
})
