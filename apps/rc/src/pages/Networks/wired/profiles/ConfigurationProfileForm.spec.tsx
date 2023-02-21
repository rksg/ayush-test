import '@testing-library/jest-dom'
import { rest } from 'msw'

import { SwitchUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { profilesExistResponse }    from './__tests__/fixtures'
import { ConfigurationProfileForm } from './ConfigurationProfileForm'

describe('Wired', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(SwitchUrlsInfo.getSwitchProfileList.url,
        (_, res, ctx) => res(ctx.json(profilesExistResponse)))
    )
  })


  it('should render Switch Configuration Profile form correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    render(<Provider><ConfigurationProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/profiles/add' }
    })

    const profileNameInput = await screen.findByLabelText('Profile Name')
    fireEvent.change(profileNameInput, { target: { value: 'profiletest' } })
    const profileDescInput = await screen.findByLabelText('Profile Description')
    fireEvent.change(profileDescInput, { target: { value: 'profiledesc' } })

    expect(await screen.findByText('Add Switch Configuration Profile')).toBeVisible()

  })
})
