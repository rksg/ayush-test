import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Provider  } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import { BetaFeaturesDrawer } from './BetaFeaturesDrawer'

import { EnableR1Beta } from './'

type MockDrawerProps = React.PropsWithChildren<{
  open: boolean
  onSave: () => void
  onClose: () => void
}>
jest.mock('./BetaFeaturesDrawer', () => ({
  ...jest.requireActual('./BetaFeaturesDrawer'),
  default: ({ onClose, open }: MockDrawerProps) =>
    open && <div data-testid={'BetaFeaturesDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Ok</button>
    </div>,
  onClose: jest.fn(),
  showActionModal: jest.fn(),
  toggleBetaStatus: jest.fn(),
  userLogout: jest.fn()
}))
jest.mock('./R1BetaTermsConditionDrawer', () => ({
  ...jest.requireActual('./R1BetaTermsConditionDrawer'),
  default: ({ onSave, onClose, open }: MockDrawerProps) =>
    open && <div data-testid={'R1BetaTermsConditionDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        onSave()
      }}>Enable Beta</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Cancel</button>
    </div>
}))

describe('Enable RUCKUS One Beta Checkbox', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  const { location } = window
  beforeEach(() => {
    mockServer.use(
      rest.put(
        UserUrlsInfo.toggleBetaStatus.url,
        (_req, res, ctx) => res(ctx.status(204))
      ),
      rest.get(
        UserUrlsInfo.getBetaStatus.url,
        (_req, res, ctx) => res(ctx.status(200))
      )
    )

    Object.defineProperty(window, 'location', {
      configurable: true,
      enumerable: true,
      value: {
        ...window.location,
        href: new URL('https://url/logout').href
      }
    })
  })
  afterEach(() => Object.defineProperty(window, 'location', {
    configurable: true, enumerable: true, value: location }))

  it('should display enable R1 beta terms & condition drawer when checkbox changed', async () => {
    render(
      <Provider>
        <EnableR1Beta
          betaStatus={false}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable RUCKUS One Beta features/i })
    expect(formItem).not.toBeChecked()
    await userEvent.click(formItem)
    const enableBtn = await screen.findByRole('button', { name: 'Enable Beta' })
    expect(enableBtn).toBeVisible()
    await userEvent.click(enableBtn)
    await waitFor(() => expect(window.location.href).toEqual('https://url/logout'))

    const currentBeta = await screen.findByRole('link', { name: 'Current beta features' })
    await userEvent.click(currentBeta)
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
    await screen.findByText('RUCKUS One Beta Features')
    await userEvent.click(await screen.findByRole('button', { name: 'Ok' }))
  })

  it('should disable beta features', async () => {
    render(
      <Provider>
        <EnableR1Beta
          betaStatus={true}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable RUCKUS One Beta features/i })
    expect(formItem).toBeChecked()
    await userEvent.click(formItem)
    const disableBtn = await screen.findByRole('button', { name: 'Disable Beta Features' })
    expect(disableBtn).toBeVisible()
    await userEvent.click(disableBtn)
    await waitFor(() => expect(window.location.href).toEqual('https://url/logout'))
  })

  it('should show beta features drawer', async () => {
    const onCloseFn = jest.fn()
    // eslint-disable-next-line max-len
    const content = 'In order to enable the Beta features, we have to log you out. Once you log-in back, the features will be available for you to use.'
    render(
      <Provider>
        <BetaFeaturesDrawer
          visible={true}
          setVisible={onCloseFn}
          onClose={onCloseFn}
        />
      </Provider>, {
        route: { params }
      })
    await waitFor(() => screen.findAllByRole('dialog'))
    expect(await screen.findByText(content)).toBeInTheDocument()
    expect(await screen.findByText('Enabling Beta Features')).toBeVisible()
    expect(await screen.findByText('RUCKUS One Beta Features')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Log Out Now' }))
    await waitFor(() => expect(window.location.href).toEqual('/logout'))
  })
})
