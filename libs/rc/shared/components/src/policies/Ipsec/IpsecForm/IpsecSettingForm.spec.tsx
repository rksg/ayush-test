import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { ipSecApi }                                                          from '@acx-ui/rc/services'
import { IpsecUrls }                                                         from '@acx-ui/rc/utils'
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
})
