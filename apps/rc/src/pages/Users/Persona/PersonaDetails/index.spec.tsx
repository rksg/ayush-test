import { rest } from 'msw'

import {
  DpskUrls,
  PersonaUrls,
  MacRegListUrlsInfo,
  PersonaBaseUrl
} from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, fireEvent } from '@acx-ui/test-utils'

import {
  mockDpskPool,
  mockMacRegistration,
  mockMacRegistrationList,
  mockPersona,
  mockPersonaGroup,
  mockPersonaGroupList
} from '../__tests__/fixtures'

import { PersonaDevicesTable } from './PersonaDevicesTable'

import PersonaDetails from './index'


describe('Persona Details', () => {
  let params: { tenantId: string, personaGroupId: string, personaId: string }

  beforeEach( async () => {
    mockServer.use(
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockPersonaGroup))
      ),
      rest.get(
        PersonaUrls.getPersonaById.url,
        (req, res, ctx) => res(ctx.json(mockPersona))
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
        MacRegListUrlsInfo.getMacRegistrationPools.url,
        (req, res, ctx) => res(ctx.json(mockMacRegistrationList))
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockDpskPool))
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
          path: '/:tenantId/users/persona-management/persona-group/:personaGroupId/persona/:personaId'
        }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await screen.findByRole('heading', { level: 1, name: mockPersona.name })
    await screen.findByRole('heading', { level: 4, name: /Devices/i })
    await screen.findByRole('link', { name: mockPersonaGroup.name })
  })

  it('should add devices', async () => {
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        // eslint-disable-next-line max-len
        route: { params, path: '/:tenantId/users/persona-management/persona-group/:personaGroupId/persona/:personaId' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const addButton = await screen.findByRole('button', { name: /Add Device/i })
    fireEvent.click(addButton)
  })

  it('should config persona details', async () => {
    render(
      <Provider>
        <PersonaDetails />
      </Provider>, {
        // eslint-disable-next-line max-len
        route: { params, path: '/:tenantId/users/persona-management/persona-group/:personaGroupId/persona/:personaId' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const configButton = await screen.findByRole('button', { name: /Configure/i })
    fireEvent.click(configButton)

    const personaName = screen.getByLabelText(/Persona Name/i) as HTMLInputElement
    expect(personaName.value).toBe(mockPersona.name)

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    fireEvent.click(configButton)
    fireEvent.change(personaName, { target: { value: 'New persona name' } })

    const applyButton = await screen.findByRole('button', { name: /Apply/i })
    fireEvent.click(applyButton)
  })

  it('should delete selected devices', async () => {
    render(
      <Provider>
        <PersonaDevicesTable persona={mockPersona} title={'Devices'}/>
      </Provider>, {
        // eslint-disable-next-line max-len
        route: { params, path: '/:tenantId/users/persona-management/persona-group/:personaGroupId/persona/:personaId' }
      }
    )

    const targetDevice = mockPersona?.devices
      ? mockPersona.devices[0]
      : { macAddress: 'mock-mac-address', personaId: mockPersona.id }
    const row = await screen.findByRole('cell', { name: targetDevice.macAddress })
    fireEvent.click(row)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    const deleteDeviceButton = await screen.findAllByRole('button', { name: /Delete/i })
    deleteDeviceButton.forEach(item => {
      fireEvent.click(item)
    })
  })
})
