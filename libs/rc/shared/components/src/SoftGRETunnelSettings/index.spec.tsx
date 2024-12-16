import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { softGreApi }      from '@acx-ui/rc/services'
import { SoftGreUrls }     from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { mockSoftgreViewModel }   from './fixture'
import { SoftGREProfileSettings } from './SoftGREProfileSettings'
import { SoftGRETunnelSettings }  from './SoftGRETunnelSettings'

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
            softGreProfileId={''}
            softGreTunnelEnable={true}
            readonly={false}
          />
        </Form>
      </Provider>
    )
    expect(await screen.findByTestId('enable-softgre-tunnel-banner')).toBeInTheDocument()
  })
  it('Should not display softgre tunnel banner', () => {
    render(
      <Provider>
        <Form>
          <SoftGRETunnelSettings
            index={1}
            softGreProfileId={''}
            softGreTunnelEnable={false}
            readonly={false}
          />
        </Form>
      </Provider>
    )
    expect(screen.queryByTestId('enable-softgre-tunnel-banner')).not.toBeInTheDocument()
  })
  it('Should not be disabled is readonly is false', async () => {
    render(
      <Provider>
        <Form>
          <SoftGREProfileSettings
            index={1}
            softGreProfileId={''}
            readonly={false}
          />
        </Form>
      </Provider>
    )
    const dropdown = await screen.findByRole('combobox')
    expect(dropdown).not.toBeDisabled()
    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = await screen.findByText('SoftGre1')
    fireEvent.mouseDown(option)
  })

  it('Should be disabled is readonly is true', async () => {
    render(
      <Provider>
        <Form>
          <SoftGREProfileSettings
            index={1}
            softGreProfileId={''}
            readonly={true}
          />
        </Form>
      </Provider>
    )
    const dropdown = await screen.findByRole('combobox')
    expect(dropdown).toBeDisabled()
  })

})
