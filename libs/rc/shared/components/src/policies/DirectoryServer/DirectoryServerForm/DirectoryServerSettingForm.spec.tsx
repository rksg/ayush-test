import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }                                                      from '@acx-ui/feature-toggle'
import { directoryServerApi }                                                from '@acx-ui/rc/services'
import { DirectoryServerUrls }                                               from '@acx-ui/rc/utils'
import { Path }                                                              from '@acx-ui/react-router-dom'
import { Provider, store }                                                   from '@acx-ui/store'
import { mockServer, render, screen, renderHook, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockDirectoryServerTable }   from './__tests__/fixtures'
import { DirectoryServerSettingForm } from './DirectoryServerSettingForm'


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

const editViewPath = '/:tenantId/t/policies/directoryServer/:policyId/edit'
const createViewPath = '/:tenantId/t/policies/directoryServer/create'

const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  policyId: 'a5ac9a7a3be54dba9c8741c67d1c41fa'
}

const user = userEvent.setup()

describe('DirectoryServerSettingForm', () => {
  beforeEach(() => {
    store.dispatch(directoryServerApi.util.resetApiState())

    mockServer.use(
      rest.post(
        DirectoryServerUrls.getDirectoryServerViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockDirectoryServerTable.data))
      ),
      rest.get(
        DirectoryServerUrls.getDirectoryServer.url,
        (_, res, ctx) => res(ctx.json(mockDirectoryServerTable.data.data[0]))
      )
    )
  })

  it('should show error message while DirectoryServer Name is duplicated', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })

    render(
      <Provider>
        <Form form={formRef.current}><DirectoryServerSettingForm /></Form>
      </Provider>,
      { route: { path: editViewPath, params } }
    )

    const policyNameField = await screen.findByLabelText(/Profile Name/i)
    await user.clear(policyNameField)
    await user.type(policyNameField, 'Online LDAP Test Server2')
    await user.tab()

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)

    expect(await screen.findByText('DirectoryServer with that name already exists')).toBeVisible()
  })

  it('should validate gateway address successfully', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })
    render(
      <Provider>
        <Form form={formRef.current}><DirectoryServerSettingForm /></Form>
      </Provider>,
      { route: { path: createViewPath, params } }
    )
    const profileNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await user.type(profileNameField, '123')
    // eslint-disable-next-line max-len

    const host = await screen.findByLabelText(/FQDN or IP Address/i)
    await user.type(host, '1.2.3.4.5')
    const errMsg = await screen.findByText('Please enter a valid FQDN or IP address')
    expect(errMsg).toBeVisible()
    await user.clear(host)
    await user.type(host,'1.1.1.1')
    expect(errMsg).not.toBeInTheDocument()
  })

  it('should render correct on readMode', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })

    const currentData = mockDirectoryServerTable.data.data[0]

    render(
      <Provider>
        <Form form={formRef.current}>
          <DirectoryServerSettingForm
            readMode
            policyId={currentData.id}/>
        </Form>
      </Provider>,
      { route: { params } }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Active Directory')).toBeVisible()
    expect(await screen.findByText('Server Address')).toBeVisible()
    expect(await screen.findByText(`${currentData.host}:${currentData.port}`)).toBeVisible()
    expect(await screen.findByText('Off')).toBeVisible()
  })

  it('should render identity attributes mapping when FF enabled', async () => {
    const { result: formRef } = renderHook(() => {
      return Form.useForm()[0]
    })

    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <Form form={formRef.current}>
          <DirectoryServerSettingForm
            policyId={params.policyId}
          />
        </Form>
      </Provider>,
      { route: { params } }
    )

    expect(await screen.findByText('Identity Attributes & Claims Mapping')).toBeVisible()
  })
})
