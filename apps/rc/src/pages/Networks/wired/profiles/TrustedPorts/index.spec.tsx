import '@testing-library/jest-dom'
import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'

import { SwitchConfigurationProfile }        from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { fireEvent, render, screen, within } from '@acx-ui/test-utils'

import { ConfigurationProfileFormContext, ConfigurationProfileType } from '../ConfigurationProfileFormContext'

import { TrustedPorts } from '.'

const currentData = {
  name: 'test-profile',
  description: '',
  acls: [],
  vlans: [{ arpInspection: true, switchFamilyModels: [] }]
}

describe('Wired - TrustedPorts', () => {
  const params = {
    tenantId: 'tenant-id'
  }
  const configureProfileContextValues = {
    editMode: false,
    currentData
  } as unknown as ConfigurationProfileType

  const trustedPorts = [{
    id: '022a36c0c49644d7b8ab94f157d70bd5',
    model: 'ICX7150-48',
    slots: [
      { slotNumber: 1, enable: true },
      { slotNumber: 3, enable: true, option: '4X1/10G' },
      { slotNumber: 2, enable: true, option: '2X1G' }
    ],
    trustPorts: ['1/1/2'],
    trustedPortType: 'all',
    vlanDemand: false

  }]

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should handle add trusted ports correctly', async () => {
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <TrustedPorts />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/ })

    await userEvent.click(await screen.findByRole('button', { name: 'Add Model' }))
    const dialog = await screen.findByTestId('trustedPortModal')
    const family = await within(dialog).findByTestId('ICX7150')
    await userEvent.click(family)
    const model = await within(dialog).findByTestId('24')
    await userEvent.click(model)
    const nextTrustPortButton = await within(dialog).findByRole('button', { name: 'Next' })
    await userEvent.click(nextTrustPortButton)

    fireEvent.change(await within(dialog).findByRole('combobox'), {
      target: { value: '1/1/1' }
    })
    const saveTrustPortButton = await within(dialog).findAllByRole('button', { name: 'Finish' })
    await userEvent.click(saveTrustPortButton[0])
  })

  it('should handle edit trusted ports correctly', async () => {
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            trustedPorts
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <TrustedPorts />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/ })

    const row = await screen.findByRole('row', { name: /ICX7150-48/i })
    fireEvent.click(await within(row).findByRole('radio'))

    const editButton = await screen.findByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
    await userEvent.click((await screen.findAllByText('Trusted Ports'))[1])
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
  })

  it('should handle delete trusted ports correctly', async () => {
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
            trustedPorts
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <TrustedPorts />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/add' }
      })

    await screen.findByRole('heading', { level: 3, name: /Trusted Ports/ })

    const row = await screen.findByRole('row', { name: /ICX7150-48/i })
    fireEvent.click(await within(row).findByRole('radio'))

    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    fireEvent.click(await screen.findByRole('button', { name: /Delete/i }))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Trust Port' }))
  })
})
