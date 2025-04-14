
import { rest } from 'msw'

import { ClientUrlsInfo, CommonRbacUrlsInfo, CommonUrlsInfo, PersonaUrls, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                            from '@acx-ui/store'
import { mockServer, render, waitFor, screen }                                                 from '@acx-ui/test-utils'

import IdentityClientTable from './IdentityClientTable'

import { IdentityDetailsContext } from '.'


const testPersonaId = '0bc7a408-c4b8-416b-a798-522a5f4ec274'
const testPersonaGroupId = 'de055d66-8b4a-41b2-b064-a89cb4a06bbf'
const mockedIdentityClientList = {
  fields: null,
  totalElements: 10,
  totalPages: 1,
  page: 1,
  content: [
    {
      id: 'device-id-1',
      tenantId: 'tenant-id',
      groupId: testPersonaGroupId,
      identityId: testPersonaId,
      clientMac: '11:11:11:11:11:11',
      networkId: 'network-id-1'
    },
    {
      id: 'device-without-mapping',
      tenantId: 'tenant-id',
      groupId: testPersonaGroupId,
      identityId: testPersonaId,
      clientMac: '99:99:99:99:99:99'
    }
  ]
}

describe('IdentityClientTable', () => {
  const params = {
    personaGroupId: 'group-id',
    personaId: 'persona-id'
  }
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
              venueInformation: { id: 'VENUE_ID', name: 'UI-TEST-VENUE' },
              apInformation: { serialNumber: 'AP_SERIAL_NUMBER', name: 'UI team ONLY' },
              networkInformation: { id: 'network-id-1',authenticationMethod: 'Standard+Mac' },  // for MAC auth devices
              lastUpdatedTime: '2022-01-01T00:00:00.000Z'
            },
            {
              osType: 'Windows',
              macAddress: '22:22:22:22:22:22',
              ipAddress: '10.206.1.93',
              username: 'dpsk-device',
              hostname: 'dpsk-hostname',
              venueInformation: { name: 'UI-TEST-VENUE' },
              apInformation: { name: 'UI team ONLY' },
              networkInformation: { authenticationMethod: 'Standard+Open' }, // for DPSK auth devices
              lastUpdatedTime: '2022-01-01T00:00:00.000Z'
            }
          ] }))
        }),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      ),
      rest.post(
        CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      ),
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      ),
      rest.post(
        SwitchRbacUrlsInfo.getSwitchClientList.url,
        (_, res, ctx) => res(ctx.json({ totalCount: 0, data: [] }))
      )
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
      </IdentityDetailsContext.Provider>,
      { route: { params } })


    await waitFor(() => expect(searchIdentityClientFn).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(getClientsFn).toHaveBeenCalledTimes(1))

    await screen.findByText('11:11:11:11:11:11')
    expect(await screen.findByText('Persona_Host_name')).toBeInTheDocument()
    expect(setCountFn).toHaveBeenCalledTimes(1)
  })
})