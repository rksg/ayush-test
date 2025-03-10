import { rest } from 'msw'

import { MacRegListUrlsInfo, MacRegistrationPool } from '@acx-ui/rc/utils'
import { Provider }                                from '@acx-ui/store'
import { mockServer, render, waitFor, screen }     from '@acx-ui/test-utils'

import { mockPersonaGroup } from '../__tests__/fixtures'


import MacAddressTab from './MacAddressTab'

import { IdentityDetailsContext } from '.'

const mockedMacReg: MacRegistrationPool = {
  autoCleanup: false,
  enabled: false,
  name: 'target-mac-reg',
  registrationCount: 0,
  defaultAccess: ''
}

const mockedMacList = {
  fields: null,
  totalElements: 10,
  totalPages: 1,
  page: 1,
  data: [ ]
}

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  MacRegistrationsTable: () => <div data-testid='MacRegistrationsTable'></div>
}))

describe('MacAddressTab', () => {
  const params = {
    tenantId: 'tenant-id',
    personaGroupId: 'persona-group-id',
    personaId: 'persona-id'
  }
  const getMacRegFn = jest.fn()

  beforeEach(() => {
    getMacRegFn.mockClear()

    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (_, res, ctx) => {
          getMacRegFn()
          return res(ctx.json(mockedMacReg))
        }
      ),
      rest.post(
        MacRegListUrlsInfo.searchMacRegistrations.url.split('?')[0],
        (_, res, ctx) => res(ctx.json(mockedMacList))
      )
    )
  })
  it('should render Mac address tab correctly', async () => {
    const setCountFn = jest.fn()

    render(<Provider>
      <IdentityDetailsContext.Provider value={{
        setDeviceCount: jest.fn(),
        setCertCount: jest.fn(),
        setDpskCount: jest.fn(),
        setMacAddressCount: setCountFn }}
      >
        <MacAddressTab
          personaGroupData={mockPersonaGroup}
        />
      </IdentityDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId' }
    })

    await waitFor(() => expect(getMacRegFn).toBeCalled())
    const targetMacName = mockedMacReg.name

    // Make sure the resource banner is displayed
    expect(screen.getByRole('link', { name: targetMacName })).toBeInTheDocument()
    // Make sure the mac table is displayed
    expect(screen.getByTestId('MacRegistrationsTable')).toBeInTheDocument()
    // Make sure the mac count is set correctly
    await waitFor(() => expect(setCountFn).toBeCalledWith(mockedMacList.totalElements))
  })
})
