import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { softGreApi }             from '@acx-ui/rc/services'
import { IpsecUrls, SoftGreUrls } from '@acx-ui/rc/utils'
import { Provider, store }        from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent,
  renderHook
} from '@acx-ui/test-utils'

import { mockSoftgreViewModel, mockSoftGreViewModelWith8Profiles } from './fixture'
import { SoftGREProfileSettings }                                  from './SoftGREProfileSettings'
import { SoftGRETunnelSettings }                                   from './SoftGRETunnelSettings'
import { useSoftGreProfileLimitedSelection }                       from './useSoftGreProfileLimitedSelection'

describe('SoftGRETunnelSettings', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    mockServer.use(
      rest.post(SoftGreUrls.getSoftGreViewDataList.url, (req, res, ctx) => {
        return res(ctx.json(mockSoftgreViewModel))
      }),
      rest.post(IpsecUrls.getIpsecViewDataList.url, (req, res, ctx) => {
        return res(ctx.json([]))
      })
    )
  })
  it('Should display softgre tunnel banner', async () => {
    render(
      <Provider>
        <Form>
          <SoftGRETunnelSettings
            index={1}
            readonly={false}
          />
        </Form>
      </Provider>
    )
    expect(screen.getByText(/Enable SoftGRE Tunnel/)).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('softgre-tunnel-switch'))
    expect(await screen.findByTestId('enable-softgre-tunnel-banner')).toBeInTheDocument()
  })
  it('Should not display softgre tunnel banner', () => {
    render(
      <Provider>
        <Form>
          <SoftGRETunnelSettings
            index={1}
            readonly={false}
          />
        </Form>
      </Provider>
    )

    expect(screen.queryByTestId('enable-softgre-tunnel-banner')).not.toBeInTheDocument()
  })
  it('Should not be disabled is readonly is false', async () => {
    render(
      <Provider>
        <Form>
          <SoftGREProfileSettings
            index={1}
            softGreProfileId={''}
            softGREProfileOptionList={[
              { label: 'SoftGre1', value: 'testvalue' }
            ]}
            readonly={false}
          />
        </Form>
      </Provider>
    )
    const dropdown = await screen.findByRole('combobox')
    expect(dropdown).not.toBeDisabled()
    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = await screen.findByText('SoftGre1')
    fireEvent.mouseDown(option)
  })

  it('Should be disabled is readonly is true', async () => {
    render(
      <Provider>
        <Form>
          <SoftGREProfileSettings
            index={1}
            softGreProfileId={''}
            readonly={true}
          />
        </Form>
      </Provider>
    )
    const dropdown = await screen.findByRole('combobox')
    expect(dropdown).toBeDisabled()
  })
  it('Should display ipsec settings', async () => {
    jest.mocked(useIsSplitOn)
      .mockImplementation(ff => ff === Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
    render(
      <Provider>
        <Form>
          <SoftGRETunnelSettings
            index={1}
            readonly={false}
          />
        </Form>
      </Provider>
    )
    expect(screen.getByText(/Enable SoftGRE Tunnel/)).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('softgre-tunnel-switch'))
    expect(await screen.findByTestId('enable-softgre-tunnel-banner')).toBeInTheDocument()
    expect(screen.getByText(/Enable IPsec/i)).toBeInTheDocument()
    expect(screen.queryByTestId('ipsec-profile-select')).not.toBeInTheDocument()
    await userEvent.click(screen.getByTestId('ipsec-switch'))
    expect(await screen.findByTestId('enable-ipsec-banner')).toBeInTheDocument()
    expect(await screen.findByTestId('ipsec-profile-select')).toBeInTheDocument()
  })
})

describe('useSoftGreProfileLimitedSelection', () => {

  const venueId = '52322e4b3a4e440495960eeece8712ed'
  const softGreProfileId = 'e19a07e22a9846fda91bda603b9ddd09'
  const whiteList = ['soft1', 'soft4', 'soft7']

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )

  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    mockServer.use(
      rest.post(SoftGreUrls.getSoftGreViewDataList.url, (req, res, ctx) => {
        return res(ctx.json(mockSoftGreViewModelWith8Profiles))
      })
    )
  })
  it('Should render SoftGre Profile option list correctly', async () => {

    const { result } = renderHook(() => useSoftGreProfileLimitedSelection(venueId), {
      wrapper,
      route: true
    })
    const options = result.current.softGREProfileOptionList
    let pass = true
    options.forEach(option => {
      if(!whiteList.includes(option.name)) {
        if (!option.disabled) {
          pass = false
        }
      }
    })
    expect(pass).toBeTruthy()
  })

  it('Should pass duplicate FQDN address validation', async () => {

    const { result } = renderHook(() => useSoftGreProfileLimitedSelection(venueId), {
      wrapper,
      route: true
    })

    const validateFunction = result.current.validateIsFQDNDuplicate
    expect(validateFunction(softGreProfileId)).toBeFalsy()
  })
})
