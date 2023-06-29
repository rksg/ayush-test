import '@testing-library/jest-dom'

import { rest } from 'msw'

import { useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { apApi, venueApi }                       from '@acx-ui/rc/services'
import { WifiUrlsInfo }                          from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'
import { getUrlForTest }                         from '@acx-ui/utils'

import { r760Ap, triBandApCap } from '../../../__tests__/fixtures'

import { ApSettingsTab } from './'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number' }

describe('ApSettingsTab', () => {
  beforeEach (() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(
        getUrlForTest(WifiUrlsInfo.getAp).replace('?operational=false', ''),
        (_, res, ctx) => res(ctx.json(r760Ap))),
      rest.get(
        WifiUrlsInfo.getApCapabilities.url,
        (_, res, ctx) => res(ctx.json(triBandApCap)))
    )
  })

  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><ApSettingsTab /></Provider>, { route: { params } })

    await screen.findByRole('tab', { name: 'Mesh' })
    fireEvent.click(await screen.findByRole('tab', { name: 'Radio' }))
  })

  it('should render correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><ApSettingsTab /></Provider>, { route: { params } })

    fireEvent.click(await screen.findByRole('tab', { name: 'LAN Port' }))
  })
})
