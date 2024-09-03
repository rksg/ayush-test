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
import { UserUrlsInfo } from '@acx-ui/user'

import { EnableR1Beta } from './'

export interface Feature {
  name: string,
  desc: string,
  enabled: boolean
}
const fakeFeatures: Feature[] = [
  {
    name: 'DPSK3',
    // eslint-disable-next-line max-len
    desc: 'Dynamic Preshared Keys working with WPA3-DSAE. Users connect their devices to a WPA2/WPA3 network with DPSK and are automatically moved to the WPA3 WLAN, allowing DPSK operation with WiFi 6e or WiFi7. DPSK3 allows the customer to take advantage of the flexibility of DPSK with the security of WPA3.',
    enabled: true
  },
  {
    name: 'SmartEdge',
    // eslint-disable-next-line max-len
    desc: 'RUCKUS SmartEdge is a platfrom to run RUCKUS services on. Network administrators can utilize SD-LAN service or Personal Identity Networking service on a SmartEdge. SD-LAN provides WLAN tunnelling using VXLAN. This will provide end users a seamless roaming experience across a network. The Personal Identity Networking service provides individual networks for users which is typically used in a multi-dwelling facility.',
    enabled: false
  },
  {
    name: 'Feature 3',
    // eslint-disable-next-line max-len
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc',
    enabled: true
  },
  {
    name: 'Feature 4',
    // eslint-disable-next-line max-len
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc',
    enabled: true
  },
  {
    name: 'Feature 5',
    // eslint-disable-next-line max-len
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar sic tempor. Sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus pronin sapien nunc',
    enabled: false
  }
]
describe('Enable RUCKUS One Beta Checkbox', () => {
  jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  // const { location } = window
  const consoleSpy = jest.spyOn(console, 'log')
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

    // Object.defineProperty(window, 'location', {
    //   configurable: true,
    //   enumerable: true,
    //   value: {
    //     ...window.location,
    //     href: new URL('https://url/').href
    //   }
    // })
  })
  // afterEach(() => Object.defineProperty(window, 'location', {
  //   configurable: true, enumerable: true, value: location }))

  it('should display enable early access features drawer when checkbox changed', async () => {
    render(
      <Provider>
        <EnableR1Beta
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
        <EnableR1Beta
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
    const disableBtn = await screen.findByRole('button', { name: 'Yes, Disable' })
    expect(disableBtn).toBeVisible()
    await userEvent.click(disableBtn)
    await waitFor(() => expect(disableBtn).not.toBeVisible())
    await waitFor(() =>expect(screen.getByRole('checkbox',
      { name: /Enable RUCKUS One Early Access features/i })).not.toBeChecked())
  })

  it('should display drawer and save correctly when manage link clicked', async () => {
    render(
      <Provider>
        <EnableR1Beta
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
    // TODO: update this when API is set up
    const value: Object[] = expect.arrayContaining([
      { ...fakeFeatures[0], enabled: !fakeFeatures[0].enabled }
    ])
    await waitFor(() => expect(consoleSpy).toHaveBeenLastCalledWith(value))
  })

  it('should show terms and conditions when link clicked', async () => {

    render(
      <Provider>
        <EnableR1Beta
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
