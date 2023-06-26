import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import { Provider  }        from '@acx-ui/store'
import { render,
  screen
} from '@acx-ui/test-utils'

import { DevicesWidget, DevicesWidgetv2 } from '.'

describe('Devices widget', () => {
  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidget apData={[]} switchData={[]} edgeData={[]} />
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(2)
  })
  it('should render correctly with right arrow enabled', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidget apData={[]} switchData={[]} edgeData={[]} enableArrowClick/>
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    expect(asFragment().querySelectorAll('div[data-testid="ArrowChevronRight"]')).toBeTruthy()
  })
})

describe('Devices widget V2', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(false)
  })
  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidgetv2 apStackedData={[]}
          switchStackedData={[]}
          edgeStackedData={[]}
          apTotalCount={1}
          switchTotalCount={1}
          edgeTotalCount={0}
        />
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    await screen.findByText('Access Points')
    await screen.findByText('Switches')
    expect(asFragment().querySelectorAll('svg').length).toBe(2)
  })
  it('should render proper data for zero devices', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidgetv2 apStackedData={[]}
          switchStackedData={[]}
          edgeStackedData={[]}
          apTotalCount={0}
          switchTotalCount={0}
          edgeTotalCount={0}
        />
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    await screen.findByText('No Access Points')
    await screen.findByText('No Switches')
    expect(asFragment().querySelectorAll('svg').length).toBe(0)
  })
  it('should render correctly with right arrow enabled', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidgetv2 apStackedData={[]}
          switchStackedData={[]}
          edgeStackedData={[]}
          apTotalCount={0}
          switchTotalCount={0}
          edgeTotalCount={0}
          enableArrowClick
        />
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    expect(asFragment().querySelectorAll('div[data-testid="ArrowChevronRight"]')).toBeTruthy()
  })
})

describe('Devices widget v1', () => {
  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidget apData={[]} switchData={[]} edgeData={[]} />
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    expect(asFragment().querySelector('svg')).toBeDefined()
    expect(asFragment().querySelectorAll('div[_echarts_instance_^="ec_"]').length).toBe(2)
  })
  it('should render correctly with right arrow enabled', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidget apData={[]} switchData={[]} edgeData={[]} enableArrowClick/>
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    expect(asFragment().querySelectorAll('div[data-testid="ArrowChevronRight"]')).toBeTruthy()
  })
})

describe('Devices widget V2 edge enabled', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
  })
  it('should render loader and then chart', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidgetv2
          apStackedData={[]}
          switchStackedData={[]}
          edgeStackedData={[]}
          apTotalCount={1}
          switchTotalCount={1}
          edgeTotalCount={2}
        />
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    await screen.findByText('Access Points')
    await screen.findByText('Switches')
    await screen.findByText('SmartEdges')
    expect(asFragment().querySelectorAll('svg').length).toBe(3)
  })

  it('should render add smartEdge when no edge', async () => {
    const params = {
      tenantId: 'tenant-id'
    }
    const { asFragment } = render(
      <Provider>
        <DevicesWidgetv2
          apStackedData={[]}
          switchStackedData={[]}
          edgeStackedData={[]}
          apTotalCount={1}
          switchTotalCount={1}
          edgeTotalCount={0}
        />
      </Provider>,
      { route: { params } })
    await screen.findByText('Devices')
    await screen.findByText('Access Points')
    await screen.findByText('Switches')
    await screen.findByText('No SmartEdges')
    expect(asFragment().querySelectorAll('svg').length).toBe(2)
    expect(screen.getByRole('link', { name: 'Add SmartEdge' }))
      .toHaveAttribute('href', '/tenant-id/t/devices/edge/add')
  })

})
