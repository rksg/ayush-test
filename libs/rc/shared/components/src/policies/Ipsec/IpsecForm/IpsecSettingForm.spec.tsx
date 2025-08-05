import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features }                                                          from '@acx-ui/feature-toggle'
import { ipSecApi }                                                          from '@acx-ui/rc/services'
import { IpsecUrls, useIsEdgeFeatureReady }                                  from '@acx-ui/rc/utils'
import { Path }                                                              from '@acx-ui/react-router-dom'
import { Provider, store }                                                   from '@acx-ui/store'
import { mockServer, render, screen, renderHook, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockIpSecTable }   from './__tests__/fixtures'
import { IpsecSettingForm } from './IpsecSettingForm'


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: ():Path => mockedTenantPath
}))

jest.mock('./EdgeIpSecForm', () => ({
  VxLanSettingForm: () => <div>VxLanSettingForm</div>
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const editViewPath = '/:tenantId/t/policies/ipsec/:policyId/edit'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  policyId: '0d89c0f5596c4689900fb7f5f53a0859'
}

const user = userEvent.setup()

describe('IpsecSettingForm', () => {
  beforeEach(() => {
    store.dispatch(ipSecApi.util.resetApiState())

    mockServer.use(
      rest.post(
        IpsecUrls.getIpsecViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockIpSecTable.data))
      )
    )
  })

  it('should show error message while IPSec Name is duplicated', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })

    render(
      <Provider>
        <Form form={formRef.current}><IpsecSettingForm /></Form>
      </Provider>,
      { route: { path: editViewPath, params } }
    )

    const policyNameField = await screen.findByLabelText(/Profile Name/i)
    await user.clear(policyNameField)
    await user.type(policyNameField, 'ipsecProfileName2')
    await user.tab()

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    expect(await screen.findByText('IPsec with that name already exists')).toBeVisible()
  })

  it('should toggle more settings', async () => {
    render(
      <Provider>
        <Form><IpsecSettingForm /></Form>
      </Provider>,
      { route: { path: editViewPath, params } }
    )

    await screen.findByLabelText(/Profile Name/i)
    const moreSettingsButton = screen.getByRole('button', { name: 'Show more settings' })
    expect(moreSettingsButton).toBeVisible()
    await user.click(moreSettingsButton)
    const lessSettingsButton = screen.getByRole('button', { name: 'Show less settings' })
    expect(lessSettingsButton).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Rekey' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Gateway & Connection' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'Failover' })).toBeVisible()
    await user.click(lessSettingsButton)
    expect(screen.getByRole('button', { name: 'Show more settings' })).toBeVisible()
  })

  it('should correctly switch tabs in more settings', async () => {
    render(
      <Provider>
        <Form><IpsecSettingForm /></Form>
      </Provider>,
      { route: { path: editViewPath, params } }
    )

    await screen.findByLabelText(/Profile Name/i)
    const moreSettingsButton = screen.getByRole('button', { name: 'Show more settings' })
    await user.click(moreSettingsButton)
    const lessSettingsButton = screen.getByRole('button', { name: 'Show less settings' })
    expect(lessSettingsButton).toBeVisible()
    const rekeyTab = screen.getByRole('tab', { name: 'Rekey' })
    expect(rekeyTab).toBeVisible()
    expect(rekeyTab).toHaveAttribute('aria-selected', 'true')
    const gatewayTab = screen.getByRole('tab', { name: 'Gateway & Connection' })
    await user.click(gatewayTab)
    expect(screen.getByRole('checkbox', { name: 'ESP Replay Window' })).toBeVisible()
  })

  describe('Edge IPsec VXLAN', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation((ff) => ff === Features.EDGE_IPSEC_VXLAN_TOGGLE)
    })

    afterEach(() => jest.clearAllMocks())

    it('should show vxlan setting form', async () => {
      render(
        <Provider>
          <Form><IpsecSettingForm /></Form>
        </Provider>,
        { route: { path: editViewPath, params } }
      )

      await screen.findByLabelText(/Profile Name/i)
      screen.getByText('Tunnel Usage Type')
      const vxlanRadio = await screen.findByRole('radio', { name: 'For RUCKUS Devices(VxLAN GPE)' })
      await user.click(vxlanRadio)
      expect(vxlanRadio).toBeChecked()
      expect(screen.getByText('VxLanSettingForm')).toBeVisible()
    })

    it('should show softgre setting form when tunnel usage type is softgre', async () => {
      render(
        <Provider>
          <Form><IpsecSettingForm /></Form>
        </Provider>,
        { route: { path: editViewPath, params } }
      )

      await screen.findByLabelText(/Profile Name/i)
      screen.getByText('Tunnel Usage Type')
      // eslint-disable-next-line max-len
      const softgreRadio = await screen.findByRole('radio', { name: 'For 3rd Party Devices(SoftGRE)' })
      await user.click(softgreRadio)
      expect(softgreRadio).toBeChecked()
      expect(screen.getByRole('button', { name: 'Show more settings' })).toBeVisible()
    })
  })
})
