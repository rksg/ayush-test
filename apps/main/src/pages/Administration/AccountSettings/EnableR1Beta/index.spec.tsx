import _        from 'lodash'
import { rest } from 'msw'

import { Provider  } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'
import { UserUrlsInfo } from '@acx-ui/user'

import { fakeBetaStatusDetail } from '../__tests__/fixtures'

import EnableR1Beta from './'
import BetaFeaturesDrawer         from './BetaFeaturesDrawer'
import R1BetaTermsConditionDrawer from './R1BetaTermsConditionDrawer'

describe('Enable R1 Beta Checkbox', () => {
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
          betaStatusData={fakeBetaStatusDetail}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable R1 Beta features/i })
    expect(formItem).not.toBeChecked()
    fireEvent.click(formItem)

    const okBtn = await screen.findByRole('button', { name: 'Enable Beta' })
    expect(okBtn).toBeVisible()

    fireEvent.click(okBtn)
    await waitFor(() => {
      expect(okBtn).not.toBeVisible()
    })

    const linkEl = await expect(screen.findByRole('link', { name: 'Current beta features'})).toBeTruthy()
  })

  it('should show terms & condition drawer', async () => {
    const mockedSetVisible = jest.fn()

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

    await screen.findByRole('dialog')
    const okBtn = await screen.findByRole('button', { name: 'Ok' })
    expect(okBtn).toBeVisible()

    fireEvent.click(okBtn)
    await waitFor(() => {
      expect(okBtn).toBeVisible()
    })

  })

  it('should display correctly if no data', async () => {
    render(
      <Provider>
        <EnableR1Beta
          betaStatusData={undefined}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const formItem = screen.getByRole('checkbox', { name: /Enable R1 Beta features/i })
    expect(formItem).not.toBeChecked()
    fireEvent.click(formItem)
  })

})
