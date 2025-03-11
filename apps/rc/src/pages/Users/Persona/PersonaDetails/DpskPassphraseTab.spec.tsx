import { rest } from 'msw'

import { DpskSaveData, DpskUrls, ExpirationType, PassphraseFormatEnum, PersonaUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, waitFor, screen, fireEvent }                            from '@acx-ui/test-utils'

import { mockPersona, mockPersonaGroup } from '../__tests__/fixtures'

import DpskPassphraseTab from './DpskPassphraseTab'

import { IdentityDetailsContext } from '.'

const mockedDpskPool: DpskSaveData = {
  id: 'dpsk-id-1',
  name: 'target-dpsk',
  expirationType: ExpirationType.DAYS_AFTER_TIME,
  passphraseFormat: PassphraseFormatEnum.NUMBERS_ONLY,
  passphraseLength: 0
}

const mockedDpskList = {
  fields: null,
  totalCount: 10,
  totalPages: 1,
  page: 1,
  data: [ ]
}

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  DpskPassphraseManagement: () => <div data-testid='DpskPassphraseManagement'></div>
}))

describe('DpskPassphraseTab', () => {
  const params = {
    tenantId: 'tenant-id',
    personaGroupId: 'persona-group-id',
    personaId: 'persona-id'
  }
  const getDpskPoolFn = jest.fn()
  const resetPassphraseFn = jest.fn()

  beforeEach(() => {
    getDpskPoolFn.mockClear()

    mockServer.use(
      rest.get(
        DpskUrls.getDpsk.url,
        (_, res, ctx) => {
          getDpskPoolFn()
          return res(ctx.json(mockedDpskPool))
        }
      ),
      rest.post(
        DpskUrls.getEnhancedPassphraseList.url,
        (_, res, ctx) => res(ctx.json(mockedDpskList))
      ),
      rest.patch(
        PersonaUrls.updatePersona.url,
        (_, res, ctx) => {
          resetPassphraseFn()
          return res(ctx.json({}))
        }
      )
    )
  })
  it('should render DPSK tab correctly', async () => {
    const setCountFn = jest.fn()

    render(<Provider>
      <IdentityDetailsContext.Provider value={{
        setDeviceCount: jest.fn(),
        setCertCount: jest.fn(),
        setDpskCount: setCountFn,
        setMacAddressCount: jest.fn() }}
      >
        <DpskPassphraseTab
          personaData={mockPersona}
          personaGroupData={mockPersonaGroup}
        />
      </IdentityDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId' }
    })

    await waitFor(() => expect(getDpskPoolFn).toBeCalled())
    const targetDpskName = mockedDpskPool.name

    // Make sure the resource banner is displayed
    expect(screen.getByRole('link', { name: targetDpskName })).toBeInTheDocument()
    // Make sure the dpsk table is displayed
    expect(screen.getByTestId('DpskPassphraseManagement')).toBeInTheDocument()
    // Make sure the dpsk count is set correctly
    await waitFor(() => expect(setCountFn).toBeCalledWith(mockedDpskList.totalCount))
  })

  it('should display regenerate dpsk hint when persona has no dpsk', async () => {
    const setCountFn = jest.fn()

    render(<Provider>
      <IdentityDetailsContext.Provider value={{
        setDeviceCount: jest.fn(),
        setCertCount: jest.fn(),
        setDpskCount: setCountFn,
        setMacAddressCount: jest.fn() }}
      >
        <DpskPassphraseTab
          personaData={{
            ...mockPersona,
            dpskGuid: undefined
          }}
          personaGroupData={mockPersonaGroup}
        />
      </IdentityDetailsContext.Provider>
    </Provider>, {
      route: {
        params,
        // eslint-disable-next-line max-len
        path: '/:tenantId/t/users/identity-management/identity-group/:personaGroupId/identity/:personaId' }
    })

    const resetButton = screen.getByRole('button', { name: 'here' })
    expect(resetButton).toBeInTheDocument()
    fireEvent.click(resetButton)
    await waitFor(() => expect(resetPassphraseFn).toBeCalled())
  })
})
