import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { Provider  }              from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor
} from '@acx-ui/test-utils'
import { BetaFeatures, UserRbacUrlsInfo, UserUrlsInfo } from '@acx-ui/user'

import { EnableR1BetaFeatures } from './EnableR1BetaFeatures'

const fakeFeatures: BetaFeatures = {
  betaFeatures: [
    {
      id: 'BETA-DPSK3',
      enabled: true
    },
    {
      id: 'PLCY-EDGE',
      enabled: false
    },
    {
      id: 'SAMPLE',
      enabled: true
    }
  ]
}
const user = require('@acx-ui/user')

describe('Enable RUCKUS One Beta Feature List Checkbox', () => {
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  jest.spyOn(user, 'useUpdateBetaFeatureListMutation')
  beforeEach(() => {
    user.useGetBetaFeatureListQuery = jest.fn().mockImplementation(() => {
      return { data: fakeFeatures }
    })
    user.hasCrossVenuesPermission = jest.fn().mockReturnValue(true)
    mockServer.use(
      rest.put(
        UserUrlsInfo.toggleBetaStatus.url,
        (_req, res, ctx) => res(ctx.status(204))
      ),
      rest.put(
        UserRbacUrlsInfo.updateBetaFeatureList.url,
        (_req, res, ctx) => res(ctx.json({ requestId: '123' }))
      )
    )
  })

  it('should display enable early access features drawer when checkbox changed', async () => {
    render(
      <Provider>
        <EnableR1BetaFeatures
          betaStatus={false}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })
    const checkbox = await screen.findByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })
    expect(checkbox).not.toBeChecked()
    await userEvent.click(checkbox)
    expect(await screen.findByText('Early Access Features')).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Enable Early Access' })).toBeEnabled()
  })

  it('cancel button should close early access features drawer correctly', async () => {
    render(
      <Provider>
        <EnableR1BetaFeatures
          betaStatus={false}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })
    const checkbox = await screen.findByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })
    await userEvent.click(checkbox)
    expect(await screen.findByText('Early Access Features')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByText('Early Access Features')).toBeNull()
    })
    expect(await screen.findByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })).not.toBeChecked()
  })

  it('should disable early access features correctly', async () => {
    render(
      <Provider>
        <EnableR1BetaFeatures
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
    const disableBtn = await screen.findByRole('button', { name: 'Yes, Disable' })
    expect(disableBtn).toBeVisible()
    await userEvent.click(disableBtn)
    await waitFor(() => expect(disableBtn).not.toBeVisible())
    await waitFor(() =>expect(screen.getByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })).not.toBeChecked())
  })

  it('should display drawer and save correctly when manage link clicked', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        reload: jest.fn()
      }
    })

    render(
      <Provider>
        <EnableR1BetaFeatures
          betaStatus={true}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })
    await userEvent.click(await screen.findByRole('link', { name: 'Manage' }))
    expect(await screen.findByText('Early Access Features')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Enable Early Access' })).toBeNull()
    const save = await screen.findByRole('button', { name: 'Save' })
    expect(save).toBeEnabled()
    await userEvent.click(screen.getAllByRole('switch')[0])
    await userEvent.click(save)

    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(() => expect(user.useUpdateBetaFeatureListMutation).toHaveLastReturnedWith(value))
    await waitFor(() => expect(window.location.reload).toHaveBeenCalled())
  })

  it('should show terms and conditions when link clicked', async () => {

    render(
      <Provider>
        <EnableR1BetaFeatures
          betaStatus={false}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const checkbox = await screen.findByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })
    await userEvent.click(checkbox)
    expect(await screen.findByText('Early Access Features')).toBeVisible()
    await userEvent.click(screen.getByRole('link', { name: /Terms & Conditions/i }))
    expect(await screen.findByText('Early Access Terms & Conditions')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(screen.queryByText('Early Access Terms & Conditions')).toBeNull())
  })

  it('should show tooltip when disabled', async () => {
    user.hasCrossVenuesPermission = jest.fn().mockReturnValue(false)
    render(
      <Provider>
        <EnableR1BetaFeatures
          betaStatus={false}
          isPrimeAdminUser={true}
        />
      </Provider>, {
        route: { params }
      })

    const checkbox = await screen.findByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })
    expect(checkbox).toBeDisabled()
    await userEvent.hover(checkbox)
    expect(await screen.findByText('You are not allowed to change this')).toBeInTheDocument()
  })

  xit('updates betaList status based on useGetBetaList', () => {
    const useGetBetaList = jest.fn().mockReturnValue(['beta1'])
    const betaList = [
      { key: 'beta1', description: 'description12233', status: false },
      { key: 'featureBeta2', description: 'description5567', status: false }
    ]
    const { result } = renderHook(() => useGetBetaList())
    expect(result.current[0]).toEqual(betaList[0].key)
  })
})
