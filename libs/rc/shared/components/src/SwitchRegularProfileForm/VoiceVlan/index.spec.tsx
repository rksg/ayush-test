import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'
import { noDataDisplay }  from '@acx-ui/utils'

import { ConfigurationProfileFormContext, ConfigurationProfileType } from '../ConfigurationProfileFormContext'

import { VoiceVlan } from '.'

jest.mock('./VoiceVlanDrawer', () => ({
  VoiceVlanDrawer: () => <div data-testid={'rc-VoiceVlanDrawer'} />
}))

const currentData = {
  name: 'test-profile',
  description: '',
  acls: [],
  vlans: [{ arpInspection: true, switchFamilyModels: [] }],
  voiceVlanOptions: [
    {
      model: 'ICX7150-24',
      taggedVlans: [
        {
          vlanId: '4',
          taggedPorts: [
            '1/1/9',
            '1/1/10'
          ]
        }
      ]
    },
    {
      model: 'ICX7650-48P',
      taggedVlans: [
        {
          vlanId: '5',
          taggedPorts: [
            '1/1/6',
            '1/1/7'
          ]
        }
      ]
    }
  ],
  voiceVlanConfigs: [
    { model: 'ICX7150-24',voiceVlans: [{ vlanId: '4',taggedPorts: ['1/1/9'] }] },
    { model: 'ICX7650-48P', voiceVlans: [] }
  ]
}

describe('Wired - VoiceVlan', () => {
  const configureProfileContextValues = {
    editMode: false,
    currentData
  } as unknown as ConfigurationProfileType
  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'add'
    }
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <VoiceVlan />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/profiles/:action' }
      })

    await screen.findByRole('heading', { level: 3, name: /Voice VLAN/ })
    expect(await screen.findByText('ICX7150-24')).toBeVisible()
    expect(await screen.findByText('ICX7650-48P')).toBeVisible()
    expect(await screen.findByText('VLAN-ID: 4')).toBeVisible()
    expect(await screen.findByText(noDataDisplay)).toBeVisible()
    const button = await screen.findAllByRole('button', { name: 'Set Voice VLAN' })
    await userEvent.click(button[0])
    expect(await screen.findByTestId('rc-VoiceVlanDrawer')).toBeVisible()
  })

})