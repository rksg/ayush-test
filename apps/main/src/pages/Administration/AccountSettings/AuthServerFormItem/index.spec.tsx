import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed }                                                                                   from '@acx-ui/feature-toggle'
import { AdministrationUrlsInfo, ApplicationAuthenticationStatus, CertificateUrls, SamlFileType, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { Provider }                                                                                                         from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  mockServer
} from '@acx-ui/test-utils'
import { RolesEnum } from '@acx-ui/types'

import { AuthServerFormItem } from '.'

const tenantAuthenticationData = [
  {
    id: '1',
    name: 'test123',
    authenticationType: TenantAuthenticationType.saml,
    clientID: '123',
    clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
    clientSecret: 'secret123'
  },
  {
    id: '2',
    name: 'test456',
    authenticationType: TenantAuthenticationType.google_workspace,
    clientID: '456',
    clientIDStatus: ApplicationAuthenticationStatus.REVOKED,
    clientSecret: 'secret456'
  }
]

const adminList = [{
  id: '123',
  email: 'test@mail.com',
  name: 'john',
  lastName: 'smith',
  role: RolesEnum.ADMINISTRATOR,
  newEmail: 'johnsmith@mail.com',
  authenticationId: '456'
},
{
  id: '789',
  email: 'jane@mail.com',
  name: 'jane',
  lastName: 'doe',
  role: RolesEnum.ADMINISTRATOR,
  newEmail: 'janedoe@mail.com',
  authenticationId: '789'
}]

const emptyData = [{ name: '1', authenticationType: TenantAuthenticationType.ldap }]

const xmlText = '<note><to>Me</to><from>You</from><heading>Reminder</heading><body></body></note>'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const services = require('@acx-ui/rc/services')
const utils = require('@acx-ui/utils')
const certList = {
  page: 1,
  totalCount: 1,
  data: [
    {
      key: 'test',
      id: 'test',
      name: 'test',
      commonName: 'test',
      value: 'test',
      status: ['VALID'],
      keyUsages: []
    }
  ]
}

describe('Auth Server Form Item', () => {
  let params: { tenantId: string }
  const unmockedFetch = global.fetch
  beforeEach(async () => {
    services.useGetAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })
    services.useGetServerCertificatesQuery = jest.fn().mockImplementation(() => {
      return { data: certList }
    })
    jest.spyOn(services, 'useDeleteTenantAuthenticationsMutation')
    mockServer.use(
      rest.delete(
        AdministrationUrlsInfo.deleteTenantAuthentications.url,
        (req, res, ctx) => res(ctx.json({ requestId: '123' }))
      ),
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (req, res, ctx) => res(ctx.json({ requestId: '456' }))
      )
    )
    utils.loadImageWithJWT = jest.fn().mockImplementation(() =>
      Promise.resolve('fileUrl')
    )
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(xmlText),
        text: () => Promise.resolve(xmlText)
      })
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  afterEach(() => {
    global.fetch = unmockedFetch
  })
  it('should render layout correctly when no data exists', async () => {
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={emptyData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Set Up' })).toBeVisible()
  })
  it('should render layout correctly when data exists', async () => {
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={tenantAuthenticationData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByRole('button', { name: 'View XML code' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Manage SSO Users' })).toBeVisible()
  })
  it('should show drawer when edit button is clicked', async () => {
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={tenantAuthenticationData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
  })
  it('should delete correctly', async () => {
    // Reset global.fetch otherwise will lead to 'response.clone is not a function' error
    global.fetch = unmockedFetch
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={tenantAuthenticationData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Delete Azure AD SSO Service')).toBeVisible()
    const input = screen.getByLabelText('Type the word "Delete" to confirm')
    fireEvent.change(input, { target: { value: 'Delete' } })
    const button = screen.getByRole('button', { name: 'Delete sso' })
    await waitFor(() => {
      expect(button).toBeEnabled()
    })
    await userEvent.click(button)
    const value: [Function, Object] = [expect.any(Function), expect.objectContaining({
      data: { requestId: '123' },
      status: 'fulfilled'
    })]
    await waitFor(()=> {
      expect(services.useDeleteTenantAuthenticationsMutation).toHaveLastReturnedWith(value)
    })
    await waitFor(() => {
      expect(screen.queryByText('Delete Azure AD SSO Service')).toBeNull()
    })

  })
  it('should render delete modal correctly when admin exists', async () => {
    services.useGetAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: [ adminList[0] ] }
    })
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={tenantAuthenticationData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Action Required')).toBeVisible()
    expect(screen.queryByText('Delete Azure AD SSO Service')).toBeNull()
    expect(screen.queryByLabelText('Type the word "Delete" to confirm')).toBeNull()
    // eslint-disable-next-line max-len
    expect(screen.getByText(/You have.*1 administrator.*set to authenticate through this 3rd party SSO service. Before you can delete the service, you will need to delete these admins or set them to authenticate through RUCKUS Identity Management./)).toBeVisible()
    const button = screen.getByRole('button', { name: 'Ok, I understand' })
    expect(button).toBeEnabled()
    await userEvent.click(button)
  })
  it('should render delete modal correctly when admin list exists', async () => {
    services.useGetAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: adminList }
    })
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={tenantAuthenticationData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Action Required')).toBeVisible()
    expect(screen.queryByText('Delete Azure AD SSO Service')).toBeNull()
    expect(screen.queryByLabelText('Type the word "Delete" to confirm')).toBeNull()
    // eslint-disable-next-line max-len
    expect(screen.getByText(/You have.*2 administrators.*set to authenticate through this 3rd party SSO service. Before you can delete the service, you will need to delete these admins or set them to authenticate through RUCKUS Identity Management./)).toBeVisible()
    const button = screen.getByRole('button', { name: 'Ok, I understand' })
    expect(button).toBeEnabled()
    await userEvent.click(button)
  })
  it('should render correctly for saml and group login enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    services.useGetAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: adminList }
    })
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={tenantAuthenticationData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'SAML' })).toBeVisible()
    expect(screen.getByText('Allowed Domains')).toBeVisible()
  })
  it('should render correctly for google workspace and group login enabled', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    services.useGetAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: adminList }
    })
    const googleData = [{
      ...tenantAuthenticationData[1]
    }]
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={googleData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Google Workspace' })).toBeVisible()
    expect(screen.getByText('Allowed Domains')).toBeVisible()
  })
  it('should show drawer when set up button is clicked', async () => {
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={emptyData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Set Up' }))
    expect(screen.getByText('Set Up SSO with 3rd Party Provider')).toBeVisible()
  })
  it('should show drawer when view xml code button is clicked', async () => {
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={tenantAuthenticationData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'View XML code' }))
    await waitFor(() => {
      expect(screen.getAllByText('IdP Metadata')).toHaveLength(2)
    })
    expect(screen.getByRole('button', { name: 'Ok' })).toBeEnabled()
  })
  it('should show drawer when view xml code button is clicked for direct url', async () => {
    const directUrlData = [{
      ...tenantAuthenticationData[0],
      samlFileType: SamlFileType.direct_url,
      samlDirectURL: 'test.com'
    }]
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={directUrlData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'View XML code' }))
    await waitFor(() => {
      expect(screen.getAllByText('IdP Metadata')).toHaveLength(2)
    })
    expect(screen.getByRole('button', { name: 'Ok' })).toBeEnabled()
  })
  it('should navigate correctly when manage sso users button is clicked', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    render(
      <Provider>
        <Form>
          <AuthServerFormItem
            tenantAuthenticationData={tenantAuthenticationData}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Manage SSO Users' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/administration/userPrivileges/ssoGroups`,
      hash: '',
      search: ''
    })
  })
})
