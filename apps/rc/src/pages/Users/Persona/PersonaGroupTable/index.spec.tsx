import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { rest }    from 'msw'

import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  PersonaUrls,
  MacRegListUrlsInfo,
  DpskUrls,
  CommonUrlsInfo,
  NetworkSegmentationUrls,
  PropertyUrlsInfo,
  DistributionSwitch,
  AccessSwitch
} from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { fireEvent, within, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  mockDpskList,
  mockDpskPool,
  mockMacRegistration,
  mockMacRegistrationList,
  mockPersonaGroupTableResult,
  replacePagination
} from '../__tests__/fixtures'

import { PersonaGroupTable } from '.'


const mockPropertyConfigOptionsResult = { content: [
  { venueId: 'venue-id', venueName: 'venue-name' }
] }

const mockNsgData = {
  id: 'nsg-id-1',
  name: 'nsg-name-1',
  venueInfos: [
    {
      venueId: 'mock_venue_1'
    }
  ]
}

const mockNsgSwitchInfoData: {
  distributionSwitches: DistributionSwitch[],
  accessSwitches: AccessSwitch[]
} = {
  distributionSwitches: [{
    id: 'c8:03:f5:3a:95:c6',
    siteName: '964fe8920291194e208b6d22370c2cc82c',
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

// To enable NSG PLM FF and allow to call api
jest.mocked(useIsTierAllowed).mockReturnValue(true)

describe.skip('Persona Group Table', () => {
  let params: { tenantId: string }
  const searchPersonaGroupApi = jest.fn()

  beforeEach(async () => {
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
      rest.get(
        replacePagination(MacRegListUrlsInfo.getMacRegistrationPools.url),
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpskPool))
      ),
      rest.get(
        replacePagination(DpskUrls.getDpskList.url),
        (req, res, ctx) => res(ctx.json(mockDpskList))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json( { data: [] }))
      ),
      rest.get(
        NetworkSegmentationUrls.getNetworkSegmentationGroupById.url,
        (req, res, ctx) => res(ctx.json(mockNsgData))
      ),
      rest.get(
        NetworkSegmentationUrls.getSwitchInfoByNSGId.url,
        (req, res, ctx) => res(ctx.json(mockNsgSwitchInfoData))
      ),
      rest.get(
        replacePagination(NetworkSegmentationUrls.getNetworkSegmentationGroupList.url),
        // just for filterable options generation
        (req, res, ctx) => res(ctx.json({ content: [{ id: 'nsg-id-1', name: 'nsg-name-1' }] }))
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyConfigsQuery.url,
        (_, res, ctx) => res(ctx.json(mockPropertyConfigOptionsResult))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/persona-management/persona-group' }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const targetPersonaGroup = mockPersonaGroupTableResult.content[0]
    const macLinkName = mockMacRegistrationList.content
      .find(pool => pool.id === targetPersonaGroup.macRegistrationPoolId)?.name

    // assert link in Table view
    await screen.findByRole('link', { name: targetPersonaGroup.name })
    await screen.findAllByRole('link', { name: macLinkName })

    // change search bar and trigger re-fetching mechanism
    const searchBar = await screen.findByRole('textbox')
    await userEvent.type(searchBar, 'search text')

    // first: table query + second: search bar changed query
    await waitFor(() => expect(searchPersonaGroupApi).toHaveBeenCalledTimes(2))
  })

  it('should delete selected persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/persona-management/persona-group' }
      })

    //   80 |       70 |   66.66 |   80.95
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const personaGroupName = mockPersonaGroupTableResult.content[2].name
    const row = await screen.findByRole('row', { name: new RegExp(personaGroupName) })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText(`Delete "${personaGroupName}"?`)
    const deletePersonaGroupButton = await screen.findByText('Delete Persona Group')
    fireEvent.click(deletePersonaGroupButton)
  })

  it('should edit selected persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/persona-management/persona-group' }
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

  it('should create persona group', async () => {
    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>, {
        route: { params, path: '/:tenantId/t/users/persona-management/persona-group' }
      })

    const createButton = await screen.findByRole('button', { name: /Add Persona Group/i })
    fireEvent.click(createButton)

    await screen.findByText('Create Persona Group')

    // const addPersonaGroupButton = await screen.findAllByRole('button', { name: /Add/i })
    // fireEvent.click(addPersonaGroupButton)
    // TODO: assert drawer without data

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

  })

  it('should export persona group to CSV', async () => {
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
              'content-disposition': 'attachment; filename=PersonaGroups_20230118100829.csv',
              'content-type': 'text/csv;charset=ISO-8859-1'
            }), ctx.text('PersonaGroup'))
          }
        })
    )

    render(
      <Provider>
        <PersonaGroupTable />
      </Provider>,{
        route: { params, path: '/:tenantId/t/users/persona-management/persona-group' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await userEvent.click(await screen.findByTestId('export-persona-group'))

    await waitFor(() => expect(exportFn).toHaveBeenCalled())
  })
})
