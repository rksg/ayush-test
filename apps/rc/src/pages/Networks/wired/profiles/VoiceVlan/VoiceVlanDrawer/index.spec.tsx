import '@testing-library/jest-dom'
import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'

import { SwitchConfigurationProfile }      from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { render, screen, waitFor, within } from '@acx-ui/test-utils'

import { ConfigurationProfileFormContext, ConfigurationProfileType } from '../../ConfigurationProfileFormContext'

import { VoiceVlanDrawer } from '.'


const currentData = {
  name: 'test-profile',
  description: '',
  acls: [],
  vlans: [{ arpInspection: true, switchFamilyModels: [] }]
}
const mockedSetVisible = jest.fn()
const mockedSetVoiceVlanConfigs = jest.fn()
describe('Wired - VoiceVlanDrawer', () => {
  const configureProfileContextValues = {
    editMode: false,
    currentData
  } as unknown as ConfigurationProfileType

  afterEach(() => {
    Modal.destroyAll()
  })

  const modelVlanOptions = {
    model: 'ICX7650-48P',
    taggedVlans: [
      {
        vlanId: '3',
        taggedPorts: [
          '1/1/5',
          '1/1/6'
        ]
      }
    ]
  }

  const modelVlanConfigs = {
    model: 'ICX7650-48P',
    voiceVlans: []
  }

  const voiceVlanConfigs = [
    { model: 'ICX7650-48P',voiceVlans: [] }
  ]

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <VoiceVlanDrawer
              visible={true}
              setVisible={mockedSetVisible}
              modelVlanOptions={modelVlanOptions}
              modelVlanConfigs={modelVlanConfigs}
              voiceVlanConfigs={voiceVlanConfigs}
              setVoiceVlanConfigs={mockedSetVoiceVlanConfigs}
            />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByText(/Set Voice VLAN/i)
    const row1 = await screen.findByRole('row', { name: /1\/1\/5/i })
    await userEvent.click(within(row1).getByRole('checkbox'))
    const editButton = await screen.findByRole('button', { name: /Edit/i })
    await userEvent.click(editButton)

    const setDialog = screen.getByRole('dialog', {
      name: /set voice vlan/i
    })
    await userEvent.click(within(setDialog).getByRole('button', {
      name: /set/i
    }))
    await waitFor(async () => expect(setDialog).not.toBeVisible())
  })

})