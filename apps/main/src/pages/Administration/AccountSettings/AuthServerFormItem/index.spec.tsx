import userEvent from '@testing-library/user-event'

import { ApplicationAuthenticationStatus, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { Provider }                                                  from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@acx-ui/test-utils'

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
    authenticationType: TenantAuthenticationType.saml,
    clientID: '456',
    clientIDStatus: ApplicationAuthenticationStatus.REVOKED,
    clientSecret: 'secret456'
  }
]

const emptyData = [{ name: '1', authenticationType: TenantAuthenticationType.ldap }]

const xmlText = '<note><to>Me</to><from>You</from><heading>Reminder</heading><body></body></note>'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
const services = require('@acx-ui/rc/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const utils = require('@acx-ui/utils')
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils')
}))

describe('Auth Server Form Item', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    services.useGetAdminListQuery = jest.fn().mockImplementation(() => {
      return { data: [] }
    })
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
  it('should render layout correctly when no data exists', async () => {
    render(
      <Provider>
        <AuthServerFormItem
          tenantAuthenticationData={emptyData}/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Set Up' })).toBeVisible()
  })
  it('should render layout correctly when data exists', async () => {
    render(
      <Provider>
        <AuthServerFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
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
        <AuthServerFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
  })
  it('should show confirmation modal when delete button is clicked', async () => {
    render(
      <Provider>
        <AuthServerFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Delete Azure AD SSO Service')).toBeVisible()
    const input = screen.getByLabelText('Type the word "Delete" to confirm')
    fireEvent.change(input, { target: 'Delete' })
    const button = screen.getByRole('button', { name: 'Delete sso' })
    // waitFor(() => {
    //   expect(button).toBeEnabled()
    // })
    await userEvent.click(button)
    // waitFor(() => {
    //   expect(screen.queryByText('Delete Azure AD SSO Service')).toBeNull()
    // })
  })
  it('should show drawer when set up button is clicked', async () => {
    render(
      <Provider>
        <AuthServerFormItem
          tenantAuthenticationData={emptyData}/>
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
        <AuthServerFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
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
    render(
      <Provider>
        <AuthServerFormItem
          tenantAuthenticationData={tenantAuthenticationData}/>
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Enable SSO with 3rd Party provider')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Manage SSO Users' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/administration/administrators`,
      hash: '',
      search: ''
    })
  })
})
