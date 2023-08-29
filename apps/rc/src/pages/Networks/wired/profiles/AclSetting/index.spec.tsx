import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { act }   from 'react-dom/test-utils'

import { SwitchConfigurationProfile }        from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { fireEvent, render, screen, within } from '@acx-ui/test-utils'

import { ConfigurationProfileFormContext, ConfigurationProfileType } from '../ConfigurationProfileFormContext'

import { AclSetting } from '.'

const currentData = {
  name: 'test-profile',
  description: '',
  acls: [],
  vlans: [{ arpInspection: true, switchFamilyModels: [] }]
}
describe('Wired - AclSetting', () => {
  const configureProfileContextValues = {
    editMode: false,
    currentData
  } as unknown as ConfigurationProfileType

  const acls = [{
    aclType: 'standard',
    id: 'ed2c12c471084e35a640997240780b33',
    name: 'acl-01',
    aclRules: [{
      action: 'permit',
      id: 'c55b55e4d5e149d0a0ebe783dfe7547c',
      protocol: 'ip',
      sequence: 65000,
      source: 'any'
    }, {
      action: 'deny',
      id: 'f85299278f7048808ca01049e90c560d',
      protocol: 'ip',
      sequence: 888,
      source: '1.1.1.0/24'
    }]
  }]

  it('should handle add ACL correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    expect(await screen.findByRole('button', { name: 'Add ACL' })).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Add ACL' }))
    expect(await screen.findByLabelText('ACL Name')).toBeVisible()
    const aclNameInput = await screen.findByLabelText('ACL Name')
    fireEvent.change(aclNameInput, { target: { value: '1' } })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))
    fireEvent.change(await screen.findByLabelText('Sequence'), { target: { value: '1' } })
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should handle add extended ACL correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Add ACL' }))
    const aclNameInput = await screen.findByLabelText('ACL Name')
    fireEvent.change(aclNameInput, { target: { value: '100' } })
    const extendedOption = await screen.findByLabelText('Extended')
    await userEvent.click(extendedOption)
    await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
  })

  it('should handle edit ACL correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            acls
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    const row = await screen.findByRole('row', { name: /acl-01/i })
    fireEvent.click(await within(row).findByRole('radio'))

    const editButton = await screen.findByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should handle delete ACL correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            acls
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    const row = await screen.findByRole('row', { name: /acl-01/i })
    fireEvent.click(await within(row).findByRole('radio'))

    // fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    // await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    // fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    // await userEvent.click(await screen.findByRole('button', { name: 'Delete ACL' }))
  })

  it('should handle edit ACL rule correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            acls
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    const row = await screen.findByRole('row', { name: /acl-01/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(await within(row).findByRole('radio'))
      fireEvent.click(await screen.findByRole('button', { name: /Edit/i }))
    })

    const drawer = await screen.findByRole('dialog')
    const row2 = await screen.findByRole('row', { name: /888/i })
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(await within(row2).findByRole('radio'))
      fireEvent.click(await within(drawer).findByRole('button', { name: /Edit/i }))
    })
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
  })

  it('should handle delete ACL rule correctly', async () => {
    const params = {
      tenantId: 'tenant-id'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            acls
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <AclSetting />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /ACLs/ })

    const row = await screen.findByRole('row', { name: /acl-01/i })
    fireEvent.click(await within(row).findByRole('radio'))
    fireEvent.click(await screen.findByRole('button', { name: /Edit/i }))

    const drawer = await screen.findByRole('dialog')
    const row2 = await screen.findByRole('row', { name: /65000/i })
    fireEvent.click(await within(row2).findByRole('radio'))
    fireEvent.click(await within(drawer).findByRole('button', { name: /Delete/i }))
  })
})