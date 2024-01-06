import { rest } from 'msw'

import { Provider  } from '@acx-ui/store'
import {
  act,
  mockServer,
  render,
  screen,
  fireEvent
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
  default: ({ onSave, onClose, open }: MockDrawerProps) =>
    open && <div data-testid={'BetaFeaturesDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        onSave()
      }}>Save</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Cancel</button>
    </div>
}))

describe('Enable RUCKUS One Beta Checkbox', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
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
  })

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
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      fireEvent.click(formItem)
    })
    const enableBtn = await screen.findByRole('button', { name: 'Enable Beta' })
    expect(enableBtn).toBeVisible()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      fireEvent.click(enableBtn)
    })
    expect(enableBtn).not.toBeVisible()

    const currentBeta = await screen.findByRole('link', { name: 'Current beta features' })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      fireEvent.click(currentBeta)
    })
    const okBtn = await screen.findByRole('button', { name: 'Ok' })
    expect(okBtn).toBeVisible()

    await screen.findByText('RUCKUS One Beta Features')
  })

  it('should show terms and condition drawer', async () => {
    const mockedSetVisible = jest.fn()
    // eslint-disable-next-line max-len
    const content = 'In order to enable the Beta features, we have to log you out. Once you log-in back, the features will be available for you to use.'
    render(
      <Provider>
        <BetaFeaturesDrawer
          visible={true}
          setVisible={() => (mockedSetVisible)}
          onClose={() => (false)}
        />
      </Provider>, {
        route: { params }
      })

    await screen.findAllByRole('dialog')
    const okBtn = await screen.findByRole('button', { name: 'Log Out Now' })
    expect(okBtn).toBeVisible()
    expect(await screen.findByText(content)).toBeInTheDocument()
    expect(await screen.findByText('Enabling Beta Features')).toBeVisible()
    expect(await screen.findByText('RUCKUS One Beta Features')).toBeVisible()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      fireEvent.click(okBtn)
    })
    expect(okBtn).toBeVisible()
  })

  it('should display correctly if no data', async () => {
    render(
      <Provider>
        <EnableR1Beta
          betaStatus={undefined}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const dialog = screen.getByRole('checkbox', { name: /Enable RUCKUS One Beta features/i })
    expect(dialog).not.toBeChecked()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(() => {
      fireEvent.click(dialog)
    })
  })

})
