import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import Privacy from '.'


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
        (_, res, ctx) => res(ctx.json(settings)))
    )
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Should show ARC privacy settings', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.MSP_SERVICE_APP_MONITORING)
    render(
      <Provider>
        <Form>
          <Privacy/>
        </Form>
      </Provider>,
      { route: { params } })

    const view = screen.getByText(/Enable application-recognition and control/i)
    const switchBtn = within(view).getByRole('switch')
    expect(switchBtn).toBeVisible()
    await userEvent.click(switchBtn)
    expect(switchBtn.getAttribute('aria-checked')).toBe('true')
  })
})
