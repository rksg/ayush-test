import userEvent   from '@testing-library/user-event'
import { Form }    from 'antd'
import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import {
  MdnsProxyForwardingRule,
  BridgeServiceEnum,
  MdnsProxyUrls,
  mdnsProxyRuleTypeLabelMapping
} from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { mockServer, render, renderHook, screen } from '@acx-ui/test-utils'

import { mockedMdnsProxyList }   from './__tests__/fixtures'
import { MdnsProxySettingsForm } from './MdnsProxySettingsForm'


describe('MdnsProxySettingsForm', () => {
  mockServer.use(
    rest.get(
      MdnsProxyUrls.getMdnsProxyList.url,
      (req, res, ctx) => res(ctx.json([...mockedMdnsProxyList]))
    )
  )

  it('should set the fields value', async () => {
    const ruleToAdd: MdnsProxyForwardingRule = {
      service: BridgeServiceEnum.AIRPLAY,
      fromVlan: 1,
      toVlan: 2
    }

    const { result: ruleToAddTypeLabel } = renderHook(() => {
      return useIntl().$t(mdnsProxyRuleTypeLabelMapping[ruleToAdd.service])
    })

    render(
      <Provider>
        <Form><MdnsProxySettingsForm /></Form>
      </Provider>, {
        route: { params: { tenantId: '__tenant_ID__' }, path: '/:tenantId/t/' }
      }
    )

    await userEvent.type(await screen.findByRole('textbox', { name: /Service Name/i }), 'Test')

    await userEvent.click(await screen.findByRole('button', { name: 'Add Rule' }))
    await userEvent.click(await screen.findByRole('combobox', { name: 'Type' }))
    await userEvent.click(screen.getByText(ruleToAddTypeLabel.current))

    await userEvent.type(
      screen.getByRole('spinbutton', { name: /From VLAN/i }),
      ruleToAdd.fromVlan.toString()
    )
    await userEvent.type(
      screen.getByRole('spinbutton', { name: /To VLAN/i }),
      ruleToAdd.toVlan.toString()
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    // Check if the created data can be found in the table
    await screen.findByRole('cell', { name: ruleToAddTypeLabel.current })
    await screen.findByRole('cell', { name: ruleToAdd.fromVlan.toString() })
    await screen.findByRole('cell', { name: ruleToAdd.toVlan.toString() })
  })
})
