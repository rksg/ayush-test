import '@testing-library/jest-dom'
import { rest } from 'msw'

import { useIsSplitOn }                        from '@acx-ui/feature-toggle'
import { venueApi }                            from '@acx-ui/rc/services'
import { CommonUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import TopSystemProcess from '.'

const topProcess = [
  {
    processName: 'process',
    cpu: '1527.4',
    memory: '0.0',
    time: '313650:46.64'
  },
  {
    processName: 'ruby /space/rxg/rxgd/bin/purge_database (ruby30)',
    cpu: '59.6',
    memory: '0.3',
    time: '0:04.19'
  },
  {
    processName: 'rxgd (perl)',
    cpu: '19.9',
    memory: '0.3',
    time: '274:40.13'
  },
  {
    processName: 'process1',
    cpu: '4.4',
    memory: '0.1',
    time: '0:00.10'
  },
  {
    processName: '[kernel]',
    cpu: '0.0',
    memory: '0.6',
    time: '169:01.76'
  }
]


const params = {
  tenantId: '7b8cb9e8e99a4f42884ae9053604a376',
  gatewayId: 'bbc41563473348d29a36b76e95c50381',
  activeTab: 'overview'
}


describe('RWG Dashboard statistics', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getGatewayTopProcess.url,
        (req, res, ctx) => res(ctx.json({ response: topProcess }))
      )
    )

    store.dispatch(venueApi.util.resetApiState())
  })

  it('should correctly render donut', async () => {

    const { asFragment } = await render(<Provider><TopSystemProcess /> </Provider>, {
      route: { params }
    })

    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeNull()
    })

    // eslint-disable-next-line testing-library/no-node-access
    expect(await asFragment().querySelector('div[_echarts_instance_^="ec_"]')).not.toBeNull()

    expect(await screen.findByText('process')).toBeInTheDocument()
    expect(await screen.findByText('process1')).toBeInTheDocument()
    expect(await screen.findByText('rxgd (perl)')).toBeInTheDocument()

  })

})
