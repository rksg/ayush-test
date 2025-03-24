import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen }                  from '@acx-ui/test-utils'
import { UserProfileContext, UserProfileContextProps } from '@acx-ui/user'

import { fakeTenantDetails } from '../AccountSettings/__tests__/fixtures'
import { fakeUserProfile }   from '../Administrators/__tests__/fixtures'

import Privacy from '.'

const isPrimeAdmin: () => boolean = jest.fn().mockReturnValue(true)

const userProfileContextValues = {
  data: fakeUserProfile,
  isPrimeAdmin
} as UserProfileContextProps


const params = { tenantId: 'tenant-id' }

const settings = {
  privacyFeatures: [
    {
      featureName: 'APP_VISIBILITY',
      isEnabled: false
    },
    {
      featureName: 'ARC',
      isEnabled: false
    }
  ]
}

describe('Privacy settings', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(AdministrationUrlsInfo.getPrivacySettings.url,
        (req, res, ctx) => res(ctx.json(settings))),
      rest.patch(AdministrationUrlsInfo.updatePrivacySettings.url,
        (_, res, ctx) => res(ctx.json(settings))),
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (_req, res, ctx) => res(ctx.json({ ...fakeTenantDetails, tenantType: 'MSP' }))
      )
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should show ARC privacy settings', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_APP_MONITORING)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_APP_VISIBILITY)
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Privacy/>
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } })

    expect(screen.getByText(/Enable application-recognition and control/i)).toBeVisible()
    const switchBtn = screen.getAllByRole('switch')[1]
    expect(switchBtn).toBeVisible()
    await userEvent.click(switchBtn)
    expect(switchBtn.getAttribute('aria-checked')).toBe('true')
    expect(await screen.findByText('Application-recognition and control is enabled')).toBeVisible()
  })

  it('Should show Application Visibility privacy settings', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_APP_MONITORING)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_APP_VISIBILITY)
    render(
      <Provider>
        <UserProfileContext.Provider
          value={userProfileContextValues}
        >
          <Privacy/>
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } })

    // eslint-disable-next-line max-len
    expect(screen.getByText(/Enable application visibility for all MSP customer tenants/i)).toBeVisible()
    const switchBtn = screen.getAllByRole('switch')[0]
    expect(switchBtn).toBeVisible()
    await userEvent.click(switchBtn)
    expect(switchBtn.getAttribute('aria-checked')).toBe('true')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Application visibility is enabled')).toBeVisible()
  })

  it('Should show correct privacy settings for non prime admin', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_APP_MONITORING)
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_APP_VISIBILITY)
    render(
      <Provider>
        <UserProfileContext.Provider
          value={{ ...userProfileContextValues, isPrimeAdmin: () => false }}
        >
          <Privacy/>
        </UserProfileContext.Provider>
      </Provider>,
      { route: { params } })

    // eslint-disable-next-line max-len
    expect(screen.getByText(/Application visibility for all MSP customer tenants is Disabled/i)).toBeVisible()
    // eslint-disable-next-line max-len
    expect(screen.getByText(/Application-recognition and control is Disabled/i)).toBeVisible()
  })
})
