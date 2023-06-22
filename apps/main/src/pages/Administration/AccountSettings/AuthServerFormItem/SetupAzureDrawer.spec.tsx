import userEvent from '@testing-library/user-event'

import { CsvSize }                                                   from '@acx-ui/rc/components'
import { ApplicationAuthenticationStatus, TenantAuthenticationType } from '@acx-ui/rc/utils'
import { Provider }                                                  from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import { SetupAzureDrawer } from './SetupAzureDrawer'

const tenantAuthenticationData =
{
  id: '1',
  name: 'test123.xml',
  authenticationType: TenantAuthenticationType.saml,
  clientID: '123',
  clientIDStatus: ApplicationAuthenticationStatus.ACTIVE,
  clientSecret: 'secret123'
}

describe('Setup Azure Drawer', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  it('should render edit layout correctly', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    expect(screen.getByText('Edit SSO with 3rd Party Provider')).toBeVisible()
    expect(screen.getByText('IdP Metadata')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Change File' })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Paste IdP Metadata code instead' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Upload file instead' }))
    expect(await screen.findByRole('button', { name: 'Change File' })).toBeVisible()
  })
  it('should close drawer when cancel button clicked', async () => {
    const mockedCloseDrawer = jest.fn()
    render(
      <Provider>
        <SetupAzureDrawer
          title={'Edit SSO with 3rd Party Provider'}
          visible={true}
          isEditMode={true}
          setEditMode={jest.fn()}
          editData={tenantAuthenticationData}
          setVisible={mockedCloseDrawer}
          maxSize={CsvSize['5MB']}
          maxEntries={512}
          acceptType={['xml']} />
      </Provider>, {
        route: { params }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockedCloseDrawer).toHaveBeenCalledWith(false)
  })

})
