
import { rest } from 'msw'

import { ClientUrlsInfo, PersonaUrls }         from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, waitFor, screen } from '@acx-ui/test-utils'

import IdentityClientTable from './IdentityClientTable'

import { IdentityDetailsContext } from '.'


const testPersonaId = '0bc7a408-c4b8-416b-a798-522a5f4ec274'
const testPersonaGroupId = 'de055d66-8b4a-41b2-b064-a89cb4a06bbf'
const mockedIdentityClientList = {
  fields: null,
  totalElements: 10,
  totalPages: 1,
  page: 1,
  content: [{
    id: 'device-id-1',
    tenantId: 'tenant-id',
    groupId: testPersonaGroupId,
    identityId: testPersonaId,
    clientMac: '11:11:11:11:11:11'
  }]
}

describe('IdentityClientTable', () => {
  const searchIdentityClientFn = jest.fn()
  const getClientsFn = jest.fn()

  beforeEach(() => {
    searchIdentityClientFn.mockClear()
    getClientsFn.mockClear()

    mockServer.use(
      rest.post(
        PersonaUrls.searchIdentityClients.url.split('?')[0],
        (_, res, ctx) => {
          searchIdentityClientFn()
          return res(ctx.json(mockedIdentityClientList))
        }
      ),
      rest.post(
        ClientUrlsInfo.getClients.url,
        (_, res, ctx) => {
          getClientsFn()
          return res(ctx.json({ data: [
            {
              osType: 'Windows',
              macAddress: '11:11:11:11:11:11',
              ipAddress: '10.206.1.93',
              username: 'My Device',
              hostname: 'Persona_Host_name',
              venueInformation: { name: 'UI-TEST-VENUE' },
              apInformation: { name: 'UI team ONLY' },
              networkInformation: { authenticationMethod: 'Standard+Mac' }  // for MAC auth devices
            },
            {
              osType: 'Windows',
              macAddress: '22:22:22:22:22:22',
              ipAddress: '10.206.1.93',
              username: 'dpsk-device',
              hostname: 'dpsk-hostname',
              venueInformation: { name: 'UI-TEST-VENUE' },
              apInformation: { name: 'UI team ONLY' },
              networkInformation: { authenticationMethod: 'Standard+Open' }// for DPSK auth devices
            }
          ] }))
        })
    )
  })

  it('should render successfully', async () => {
    const setCountFn = jest.fn()
    render(
      <IdentityDetailsContext.Provider
        value={{
          setDeviceCount: setCountFn,
          setCertCount: jest.fn(),
          setDpskCount: jest.fn(),
          setMacAddressCount: jest.fn()
        }}>
        <Provider>
          <IdentityClientTable
            personaId={testPersonaId}
            personaGroupId={testPersonaGroupId}
          />
        </Provider>
      </IdentityDetailsContext.Provider>)


    await waitFor(() => expect(searchIdentityClientFn).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(getClientsFn).toHaveBeenCalledTimes(1))

    expect(screen.getByText('11-11-11-11-11-11')).toBeInTheDocument()
    expect(await screen.findByText('Persona_Host_name')).toBeInTheDocument()
    expect(setCountFn).toHaveBeenCalledTimes(1)
  })
})