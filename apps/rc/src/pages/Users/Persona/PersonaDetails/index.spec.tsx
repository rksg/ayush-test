import { within } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'
import { rest }   from 'msw'

import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  DpskUrls,
  PersonaUrls,
  MacRegListUrlsInfo,
  PersonaBaseUrl,
  ClientUrlsInfo,
  ConnectionMeteringUrls
} from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, fireEvent } from '@acx-ui/test-utils'

import {
  mockConnectionMeterings,
  mockDpskPool,
  mockMacRegistration,
  mockMacRegistrationList,
  mockPersona,
  mockPersonaGroup,
  mockPersonaGroupList,
  mockUnBlockedPersona,
  replacePagination
} from '../__tests__/fixtures'

import PersonaDetails from './index'

Object.assign(navigator, {
  clipboard: {
    writeText: () => { }
  }
})

jest.mocked(useIsSplitOn).mockReturnValue(true)
jest.mocked(useIsTierAllowed).mockReturnValue(true)

describe.skip('Identity Details', () => {
  let params: { tenantId: string, personaGroupId: string, personaId: string }

  beforeEach( async () => {
    jest.spyOn(navigator.clipboard, 'writeText')

    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        PersonaUrls.getPersonaById.url,
        (req, res, ctx) => res(ctx.json(mockPersona))
      ),
      rest.post(
        PersonaUrls.addPersonaDevices.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.delete(
        PersonaUrls.deletePersonaDevices.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        PersonaBaseUrl,
        (req, res, ctx) => res(ctx.json(mockPersonaGroupList))
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
      rest.post(
        ClientUrlsInfo.getClientList.url,
        (_, res, ctx) => res(ctx.json({ data: [{
          osType: 'Windows',
          clientMac: '28:B3:71:28:78:50',
          ipAddress: '10.206.1.93',
          Username: '24418cc316df',
          hostname: 'LP-XXXXX',
          venueName: 'UI-TEST-VENUE',
          apName: 'UI team ONLY'
        }] }))
      ),
      rest.get(
        ConnectionMeteringUrls.getConnectionMeteringDetail.url,
        (req, res, ctx) => res(ctx.json(mockConnectionMeterings[0]))
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
          params,
          // eslint-disable-next-line max-len
          path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId'
        }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await screen.findByRole('heading', { level: 1, name: mockPersona.name })
    await screen.findByRole('heading', { level: 4, name: /Devices/i })
    await screen.findByRole('link', { name: mockPersonaGroup.name })
    await screen.findByRole('link', { name: mockConnectionMeterings[0].name })
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

  it('should config persona details', async () => {
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

  it('should retry vni', async () => {
    const retryFn = jest.fn()
    mockServer.use(
      rest.delete(
        PersonaUrls.allocateVni.url,
        (_, res, ctx) => {
          retryFn()
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

    const retryVniButton = await screen.findByRole('button', { name: /Retry/i })
    await userEvent.click(retryVniButton)

    expect(retryFn).toHaveBeenCalled()
  })
})
