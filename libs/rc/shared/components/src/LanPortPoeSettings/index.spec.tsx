import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { LanPortPoeSettings } from '.'


const selectedModelCaps = {
  canSupportPoeMode: true,
  canSupportPoeOut: false,
  model: 'R550',
  poeModeCapabilities: ['Auto', '802.3af', '802.3at']
}

const selectedModel = {
  lanPorts: [{
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '1',
    enabled: true
  }, {
    type: 'TRUNK',
    untagId: 1,
    vlanMembers: '1-4094',
    portId: '2',
    enabled: true
  }],
  model: 'R550',
  poeMode: 'Auto',
  useVenueSettings: false
}

const params = {
  tenantId: 'tenant-id'
}

// waiting for backend support AP PoE Mode
describe('LanPortPoeSettings', () => {
  it('should render correctly', async () => {
    render(
      <Provider>
        <Form>
          <LanPortPoeSettings
            selectedModel={selectedModel}
            selectedModelCaps={selectedModelCaps}
            useVenueSettings={false}
          />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId' }
      })

    await screen.findByText('PoE Operating Mode')
    await userEvent.click(await screen.findByRole('combobox', { name: 'PoE Operating Mode' }))
    await userEvent.click(await screen.findByTitle('802.3af'))

    const optionAuto = await screen.findByRole('option', { name: 'Auto' })
    const option802_3af = await screen.findByRole('option', { name: '802.3af' })

    expect(optionAuto.getAttribute('aria-selected')).toBe('false')
    expect(option802_3af.getAttribute('aria-selected')).toBe('true')
  })
})
