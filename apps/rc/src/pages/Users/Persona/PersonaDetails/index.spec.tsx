import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  DpskUrls,
  PersonaUrls,
  MacRegListUrlsInfo,
  PersonaBaseUrl,
  ClientUrlsInfo,
  ConnectionMeteringUrls,
  PropertyUrlsInfo,
  CertificateUrls
} from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved,within,  fireEvent, waitFor } from '@acx-ui/test-utils'

import {
  mockConnectionMeterings,
  mockDpskPool,
  mockMacRegistrationList,
  mockPersona,
  mockPersonaGroup,
  mockPersonaGroupList,
  mockUnBlockedPersona,
  mockUnit
} from '../__tests__/fixtures'

import PersonaDetails from './'

Object.assign(navigator, {
  clipboard: {
    writeText: () => { }
  }
})

jest.mock('./PersonaOverview', () => ({
  PersonaOverview: () => <div data-testid='PersonaOverview'></div>
}))
jest.mock('./CertificateTab', () => ({
  __esModule: true,
  default: () => <div data-testid='CerttificateTab'></div>
}))
jest.mock('./DpskPassphraseTab', () => ({
  __esModule: true,
  default: () => <div data-testid='DpskPassphraseTab'></div>
}))
jest.mock('./MacAddressTab', () => ({
  __esModule: true,
  default: () => <div data-testid='MacAddressTab'></div>
}))
jest.mock('./IdentityClientTable', () => ({
  __esModule: true,
  default: () => <div data-testid='IdentityClientTable'></div>
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  PersonaDrawer: () => <div data-testid='PersonaDrawer'></div>
}))

describe('Identity Details', () => {
  const getPersonaByIdFn = jest.fn()
  const getPersonaGroupByIdFn = jest.fn()
  const getIdentityCertFn = jest.fn()
  const getDpskFn = jest.fn()
  const getIdentityClientFn = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  jest.mocked(useIsTierAllowed).mockReturnValue(true)
  let params: { tenantId: string, personaGroupId: string, personaId: string }

  beforeEach( async () => {
    getPersonaByIdFn.mockClear()
    getPersonaGroupByIdFn.mockClear()
    getIdentityCertFn.mockClear()
    getDpskFn.mockClear()
    getIdentityClientFn.mockClear()
    jest.spyOn(navigator.clipboard, 'writeText')

    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_, res, ctx) => {
          getPersonaGroupByIdFn()
          return res(ctx.json(mockPersonaGroup))
        }
      ),
      rest.get(
        PersonaUrls.getPersonaById.url,
        (_, res, ctx) => {
          getPersonaByIdFn()
          return res(ctx.json(mockPersona))
        }
      ),
      rest.get(
        PropertyUrlsInfo.getUnitById.url,
        (_, res, ctx) => res(ctx.json(mockUnit))
      ),
      rest.post(
        CertificateUrls.getCertificatesByIdentity.url,
        (_, res, ctx) => {
          getIdentityCertFn()
          return res(ctx.json({
            fields: null,
            totalCount: 10,
            totalPages: 1,
            page: 1,
            data: [ ]
          }))
        }
      ),
      rest.post(
        PersonaUrls.addPersonaDevices.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.delete(
        PersonaUrls.deletePersonaDevices.url,
        (_, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        PersonaBaseUrl,
        (_, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrations.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.post(
        DpskUrls.getEnhancedPassphraseList.url,
        (_, res, ctx) => {
          getDpskFn()
          return res(ctx.json({ data: [], totalCount: 1 }))
        }
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (_, res, ctx) => res(ctx.json(mockDpskPool))
      ),
      rest.post(
        PersonaUrls.searchIdentityClients.url.split('?')[0],
        (_, res, ctx) => {
          getIdentityClientFn()
          return res(ctx.json({ data: [], totalElements: 101 }))
        }
      ),
      rest.post(
        ClientUrlsInfo.getClients.url,
        (_, res, ctx) => res(ctx.json({ data: [{
          osType: 'Windows',
          macAddress: '28:B3:71:28:78:50',
          ipAddress: '10.206.1.93',
          username: '24418cc316df',
          hostname: 'LP-XXXXX',
          venueInformation: { name: 'UI-TEST-VENUE' },
          apInformation: { name: 'UI team ONLY' }
        }] }))
      ),
      rest.get(
        ConnectionMeteringUrls.getConnectionMeteringDetail.url,
        (_, res, ctx) => res(ctx.json(mockConnectionMeterings[0]))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      personaGroupId: mockPersona.groupId,
      personaId: mockPersona.id
    }
  })


  it('should render persona details', async () => {
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        route: {
          params: {
            ...params,
            activeTab: 'overview'
          },
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId/:activeTab'
        }
      }
    )
    await waitFor(() => expect(getPersonaByIdFn).toHaveBeenCalled())
    await waitFor(() => expect(getIdentityClientFn).toHaveBeenCalled())
    await waitFor(() => expect(getPersonaGroupByIdFn).toHaveBeenCalled())
    await waitFor(() => expect(getDpskFn).toHaveBeenCalled())
    await waitFor(() => expect(getIdentityCertFn).toHaveBeenCalled())

    await screen.findByRole('heading', { name: mockPersona.name })

    expect(screen.getByTestId('PersonaOverview')).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /Devices\(100\)/i }))
    expect(screen.getByTestId('IdentityClientTable')).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /DPSK Passphrases\(1\)/i }))
    expect(screen.getByTestId('DpskPassphraseTab')).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /Certificates\(10\)/i }))
    expect(screen.getByTestId('CerttificateTab')).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('tab', { name: /Mac Addresses\(1\)/i }))
    expect(screen.getByTestId('MacAddressTab')).toBeInTheDocument()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        route: {
          params,
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId'
        }
      }
    )
    expect(await screen.findByText('Clients')).toBeVisible()
    expect(await screen.findByText('Identity Management')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Identities'
    })).toBeVisible()
  })

  it.skip('should config persona details', async () => {
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        // eslint-disable-next-line max-len
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const configButton = await screen.findByRole('button', { name: /Configure/i })
    fireEvent.click(configButton)

    // check copy to clipboard function
    const copyBtn = screen.getByTestId('copy')

    await userEvent.click(copyBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPersona.dpskPassphrase)

    const personaName = screen.getByLabelText(/Identity Name/i) as HTMLInputElement
    expect(personaName.value).toBe(mockPersona.name)

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    fireEvent.click(configButton)
    fireEvent.change(personaName, { target: { value: 'New identity name' } })

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    fireEvent.click(applyButton)
  })

  it('should blocked the persona', async () => {
    const blockedFn = jest.fn()
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaById.url,
        (req, res, ctx) => res(ctx.json(mockUnBlockedPersona))
      ),
      rest.patch(
        PersonaUrls.updatePersona.url,
        (req, res, ctx) => {
          blockedFn(req.body)
          return res(ctx.json({}))
        }
      )
    )
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        // eslint-disable-next-line max-len
        route: { params, path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId' }
      }
    )

    const blockedButton = await screen.findByRole('button', { name: /Block/i })
    await userEvent.click(blockedButton)

    const confirmButton = await within(await screen.findByRole('dialog'))
      .findByRole('button', { name: /Block/i })
    await userEvent.click(confirmButton)

    expect(blockedFn).toBeCalledWith({ revoked: true })
  })
})
