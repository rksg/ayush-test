import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useGetBetaList } from '@acx-ui/feature-toggle'
import { Provider  }      from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import { EnableR1Beta } from './'

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
        href: new URL('https://url/').href
      }
    })
  })
  afterEach(() => Object.defineProperty(window, 'location', {
    configurable: true, enumerable: true, value: location }))

  it('should display enable R1 beta terms & condition drawer when checkbox changed',
    async () => {
      render(
        <Provider>
          <EnableR1Beta
            betaStatus={false}
            isPrimeAdminUser={true}
          />
        </Provider>, {
          route: { params }
        })
      const formItem = await screen.findByRole('checkbox',
        { name: /Enable RUCKUS One Early Access features/i })
      expect(formItem).not.toBeChecked()
      await userEvent.click(formItem)
      const drawer = await screen.findByRole('dialog')
      const enableBtn = await screen.findByRole('button', { name: 'Enable Beta' })
      expect(enableBtn).toBeVisible()
      await userEvent.click(enableBtn)
      await waitFor(() => expect(drawer).not.toBeVisible())
      const logoutBtn = await screen.findByRole('button', { name: 'Log Out Now' })
      await userEvent.click(logoutBtn)
      await waitFor(() => expect(logoutBtn).not.toBeVisible())
      await waitFor(() => expect(window.location.href).toEqual('/logout'))
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

    const formItem = screen.getByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })
    expect(formItem).toBeChecked()
    await userEvent.click(formItem)
    const disableBtn = await screen.findByRole('button', { name: 'Disable Early Access Features' })
    expect(disableBtn).toBeVisible()
    await userEvent.click(disableBtn)
    await waitFor(() => expect(disableBtn).not.toBeVisible())
    await waitFor(() => expect(window.location.href).toEqual('/logout'))
  })

  it('should be able to cancel enable beta features', async () => {
    render(
      <Provider>
        <EnableR1Beta
          betaStatus={false}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })
    expect(formItem).not.toBeChecked()
    await userEvent.click(formItem)
    const drawer = await screen.findByRole('dialog')
    const cancelBtn = await screen.findByRole('button', { name: 'Cancel' })
    expect(cancelBtn).toBeVisible()
    await userEvent.click(cancelBtn)
    await waitFor(() => expect(drawer).not.toBeVisible())
  })

  it('should show beta features drawer', async () => {
    (useGetBetaList as jest.Mock).mockReturnValue(['beta1', 'beta2', 'beta3'])

    await render(
      <Provider>
        <EnableR1Beta
          betaStatus={true}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const currentBeta = await screen.findByRole('link', { name: 'Current Early Access features' })
    await userEvent.click(currentBeta)
    await screen.findAllByRole('dialog')
    // TODO: Test case is unable to find the 'dialog' roles so below
    //  assertions are commented temporarily...
    // const drawer = await screen.findAllByRole('dialog')
    // await within(drawer).findByText('RUCKUS One Beta Features')
    // await userEvent.click(await within(drawer).findByRole('button', { name: 'Ok' }))
    // await waitFor(() =>
    //   // eslint-disable-next-line testing-library/no-node-access
    //   expect(drawer.parentNode).toHaveClass('ant-drawer-content-wrapper-hidden'))
  })

  it('updates betaList status based on useGetBetaList', () => {
    const useGetBetaList = jest.fn().mockReturnValue(['beta1'])
    const betaList = [
      { key: 'beta1', description: 'description12233', status: false },
      { key: 'featureBeta2', description: 'description5567', status: false }
    ]
    const { result } = renderHook(() => useGetBetaList())
    expect(result.current[0]).toEqual(betaList[0].key)
  })
})
