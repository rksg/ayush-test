import '@testing-library/jest-dom'
import { rest } from 'msw'
import { Form }  from 'antd'

import { softGreApi }                 from '@acx-ui/rc/services'
import { SoftGreUrls }                from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockSoftgreViewModel }  from './fixture'
import { SoftGRETunnelSettings } from '@acx-ui/rc/components'

describe('SoftGRETunnelSettings', () => {
  beforeEach(() => {
    store.dispatch(softGreApi.util.resetApiState())
    mockServer.use(
      rest.post(SoftGreUrls.getSoftGreViewDataList.url, (req, res, ctx) => {
        return res(ctx.json(mockSoftgreViewModel))
      })
    )
  })
  it('Should display softgre tunnel banner', async () => {
    render(
      <Provider>
        <Form>
          <SoftGRETunnelSettings
            index={1}
            isSoftGRETunnelToggleDisable={false}
            softgreProfileId={''}
            softgreTunnelEnable={true}
            setSoftgreTunnelEnable={() => {}}
          />
        </Form>
      </Provider>
    )
    expect(await screen.findByTestId('enable-softgre-tunnel-banner')).toBeInTheDocument()
  })

})
