import { Provider  } from '@acx-ui/store'
import { render,
  screen,
  mockAutoSizer
} from '@acx-ui/test-utils'

import DevicesDonutWidget from '.'

describe('Devices widget', () => {
  mockAutoSizer()

  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesDonutWidget apData={[]} switchData={[]} />
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(2)
  })
})
