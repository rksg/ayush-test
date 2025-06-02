import { rest } from 'msw'

import { TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  PersonaUrls,
  MacRegListUrlsInfo,
  PersonaBaseUrl,
  DpskUrls,
  PropertyUrlsInfo,
  CommonUrlsInfo,
  CertificateUrls
} from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, fireEvent, within, waitFor } from '@acx-ui/test-utils'

import {
  mockDpskPool,
  mockEnabledPropertyConfig,
  mockMacRegistration,
  mockMacRegistrationList,
  mockPersonaGroup,
  mockPersonaGroupList,
  mockPersonaGroupTableResult,
  mockPersonaTableResult,
  replacePagination
} from '../__tests__/fixtures'

import { PersonaGroupDetails } from '.'

const venueData = {
  address: {
    addressLine: '1093 Main St, New York, NY, 10044, United States',
    city: 'New York',
    country: 'United States',
    latitude: 40.7690084,
    longitude: -73.9431541,
    timezone: 'America/New_York'
  },
  createdDate: '2022-07-08T04:59:22.351+00:00',
  description: 'My-Venue',
  floorPlans: [],
  id: '4c778ed630394b76b17bce7fe230cf9f',
  name: 'My-Venue',
  updatedDate: '2022-07-08T04:59:22.351+00:00'
}

const spyGetVenue = jest.fn()
const spyGetDpsk = jest.fn()
const spyGetMacReg = jest.fn()
const spyGetCertTemplate = jest.fn()

describe('Persona Group Details', () => {
  let params: { tenantId: string, personaGroupId: string }

  beforeEach( async () => {
    spyGetVenue.mockClear()
    spyGetDpsk.mockClear()
    spyGetMacReg.mockClear()
    spyGetCertTemplate.mockClear()

    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => {
          spyGetVenue()
          return res(ctx.json(venueData))
        }
      ),
      rest.get(
        PersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (_, res, ctx) => {
          spyGetMacReg()
          return res(ctx.json(mockMacRegistration))
        }
      ),
      rest.delete(
        PersonaUrls.deletePersonas.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaGroupList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchIdentityClients.url),
        (req, res, ctx) => res(ctx.json(mockPersonaGroupTableResult))
      ),
      rest.get(
        replacePagination(MacRegListUrlsInfo.getMacRegistrationPools.url),
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.post(
        replacePagination(PersonaUrls.searchPersonaList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
      ),
      rest.get(
        replacePagination(PersonaUrls.searchPersonaGroupList.url),
        (req, res, ctx) => res(ctx.json(mockPersonaTableResult))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (_, res, ctx) => {
          spyGetDpsk()
          return res(ctx.json(mockDpskPool))
        }
      ),
      rest.get(
        PropertyUrlsInfo.getPropertyConfigs.url,
        (req, res, ctx) => res(ctx.json(mockEnabledPropertyConfig))
      ),
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (_, res, ctx) => {
          spyGetCertTemplate()
          return res(ctx.json({ id: 'cert-template-1', name: 'cert-template-name' }))
        }
      ),
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (req, res, ctx) => res(ctx.json({ id: 'unit-id-1', name: 'unit-name-1' }))
      ),
      rest.post(
        CertificateUrls.getCertificatesByIdentity.url,
        (req, res, ctx) => res(ctx.json({ data: [], totalCount: 0 }))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      personaGroupId: mockPersonaGroup.id
    }
  })

  it('should render persona group details', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_ADV)

    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId'
        }
      }
    )

    // await waitFor(() => expect(spyGetPIN).toHaveBeenCalled())
    await waitFor(() => expect(spyGetVenue).toHaveBeenCalled())
    await waitFor(() => expect(spyGetDpsk).toHaveBeenCalled())
    await waitFor(() => expect(spyGetMacReg).toHaveBeenCalled())
    await waitFor(() => expect(spyGetCertTemplate).toHaveBeenCalled())

    // Check those columns render in the screen correctly.
    expect(screen.getByText(/Venue/i)).toBeInTheDocument()
    expect(screen.getByText(/DPSK Service/i)).toBeInTheDocument()
    expect(screen.getByText(/Mac Registration/i)).toBeInTheDocument()
    expect(screen.getByText(/Certificate Template/i)).toBeInTheDocument()
    expect(screen.getByText(/Personal Identity Network/i)).toBeInTheDocument()

    // Check each value render in the screen correctly.
    expect(await screen.findByText(/My-Venue/i)).toBeInTheDocument()
    expect(await screen.findByText(/dpsk-pook-1/i)).toBeInTheDocument()
    expect(await screen.findByText(/mac-name-1/i)).toBeInTheDocument()
    expect(await screen.findByText(/cert-template-name/i)).toBeInTheDocument()

    jest.mocked(useIsSplitOn).mockReset()
    jest.mocked(useIsTierAllowed).mockReset()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId'
        }
      }
    )

    expect(await screen.findByText('Clients')).toBeVisible()
    expect(await screen.findByText('Identity Management')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Identity Groups'
    })).toBeVisible()
  })

  it.skip('should delete selected persona', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetPersona = mockPersonaTableResult.content[0]
    const row = await screen.findByRole('row', { name: targetPersona.name })

    fireEvent.click(within(row).getByRole('checkbox'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText(`Delete "${targetPersona.name}"?`)
    const deleteIdentityButton = await screen.findByText(/Delete Identity/i)
    fireEvent.click(deleteIdentityButton)
  })

  it.skip('should edit selected persona', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetPersona = mockPersonaTableResult.content[1]
    const row = await screen.findByRole('row', { name: targetPersona.name })
    fireEvent.click(within(row).getByRole('checkbox'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)

    const personaName = await screen.findByLabelText(/Identity Name/i) as HTMLInputElement
    expect(personaName.value).toBe(targetPersona.name)
  })

  it.skip('should config persona group details', async () => {
    render(
      <Provider>
        <PersonaGroupDetails />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId'
        }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const configButton = await screen.findByRole('button', { name: /Configure/i })
    fireEvent.click(configButton)

    const groupName = screen.getByLabelText(/Identity Group Name/i) as HTMLInputElement
    expect(groupName.value).toBe(mockPersonaGroup.name)

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    fireEvent.click(configButton)
    fireEvent.change(groupName, { target: { value: 'New identity group name' } })

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    fireEvent.click(applyButton)
  })
})
