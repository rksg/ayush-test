import { rest } from 'msw'

import * as mspServices                from '@acx-ui/msp/services'
import { MspUrlsInfo }                 from '@acx-ui/msp/utils'
import { store, Provider, baseMspApi } from '@acx-ui/store'
import {
  mockServer,
  renderHook,
  waitFor,
  render,
  screen
} from '@acx-ui/test-utils'

import { useLogo } from './useLogo'

jest.mock('@acx-ui/main/components', () => ({
  Logo: () => <div data-testid='mocked-logo' />
}))

const mspEcProfileData = {
  msp_label: '',
  name: '',
  service_effective_date: '',
  service_expiration_date: '',
  is_active: false
}

const mspParentLogoUrlData = {
  logo_url: ''
}

const tenantId = '8c36a0a9ab9d4806b060e112205add6f'

describe('useLogo', () => {
  beforeEach(() => {
    store.dispatch(baseMspApi.util.resetApiState())
  })

  it('renders null when MSP-EC profile is not loaded', () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (_req, res, ctx) => res(
          ctx.delay(2000),
          ctx.json(mspEcProfileData)
        )
      )
    )
    const { result } = renderHook(() => useLogo(tenantId), { wrapper: Provider })
    expect(result.current).toBeNull()
  })

  it('renders null when MSP-EC profile loaded but logo is not loaded', () => {
    const mspServicesSpy = jest.spyOn(mspServices, 'useGetMspEcProfileQuery')
      .mockReturnValue({
        data: { ...mspEcProfileData, msp_label: 'some-label' },
        refetch: jest.fn()
      })
    mockServer.use(
      rest.get(
        MspUrlsInfo.getParentLogoUrl.url,
        (_req, res, ctx) => res(
          ctx.delay(2000),
          ctx.json(mspParentLogoUrlData)
        )
      )
    )
    const { result } = renderHook(() => useLogo(tenantId), { wrapper: Provider })
    expect(result.current).toBeNull()
    mspServicesSpy.mockRestore()
  })

  it('renders product logo when not MSP-EC', async () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (_req, res, ctx) => res(ctx.json(mspEcProfileData))
      )
    )
    const { result } = renderHook(() => useLogo(tenantId), { wrapper: Provider })
    await waitFor(() => expect(result.current).not.toBeNull())
    render(result.current as React.ReactElement)
    expect(await screen.findByTestId('mocked-logo')).toBeVisible()
  })

  it('renders product logo when MSP-EC but no custom logo', async () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (_req, res, ctx) => res(ctx.json({ ...mspEcProfileData, msp_label: 'some-label' }))
      )
    )
    mockServer.use(
      rest.get(
        MspUrlsInfo.getParentLogoUrl.url,
        (_req, res, ctx) => res(ctx.json(mspParentLogoUrlData))
      )
    )
    const { result } = renderHook(() => useLogo(tenantId), { wrapper: Provider })
    await waitFor(() => expect(result.current).not.toBeNull())
    render(result.current as React.ReactElement)
    expect(await screen.findByTestId('mocked-logo')).toBeVisible()
  })

  it('renders custom logo', async () => {
    mockServer.use(
      rest.get(
        MspUrlsInfo.getMspEcProfile.url,
        (_req, res, ctx) => res(ctx.json({ ...mspEcProfileData, msp_label: 'some-label' }))
      )
    )
    mockServer.use(
      rest.get(
        MspUrlsInfo.getParentLogoUrl.url,
        (_req, res, ctx) => res(ctx.json({ logo_url: 'some-url' }))
      )
    )
    const { result } = renderHook(() => useLogo(tenantId), { wrapper: Provider })
    await waitFor(() => expect(result.current).not.toBeNull())
    render(result.current as React.ReactElement)
    expect(await screen.findByAltText('some-label')).toBeVisible()
  })
})
