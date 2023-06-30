import '@testing-library/jest-dom'

import { defineMessage } from 'react-intl'

import { cssStr }                    from '@acx-ui/components'
import { formatter }                 from '@acx-ui/formatter'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { getFormattedToFunnel } from './config'
import { FunnelChart, Labels }  from './funnelChart'

export const valueFormatter = (value: number) => formatter('durationFormat')(value)


const stages = {
  authFailure: 228.46716757166308,
  assoFailure: 252.04659838138593,
  eapFailure: 352.08455161065757,
  radiusFailure: 252.82345132743362,
  dhcpFailure: 97.25188470066519
}
const colors = [
  cssStr('--acx-accents-blue-80'),
  cssStr('--acx-accents-blue-70'),
  cssStr('--acx-accents-blue-60'),
  cssStr('--acx-accents-blue-55'),
  cssStr('--acx-accents-blue-50')
]
describe('Funnel Chart', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1280
    })
  })
  it('should render ttc FunnelChart', async () => {
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc', stages)}
          colors={colors}
          selectedStage={'dhcpFailure'}
          onSelectStage={() => {}}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    expect(await screen.findByText('802.11 Auth.: 19.32%(228 ms)')).toBeVisible()
  })
  it('should handle resize', async () => {
    global.window = window

    const onResize = jest.fn()
    window.addEventListener('resize', onResize)
    window.dispatchEvent(new Event('resize'))

    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc', stages)}
          colors={colors}
          selectedStage={null}
          onSelectStage={() => {}}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    expect(onResize).toHaveBeenCalled()
  })
  it('should show No data for empty stages', async () => {
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={[]}
          colors={colors}
          selectedStage={null}
          onSelectStage={() => {}}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    expect(await screen.findByText('No data to display')).toBeVisible()
  })
  it('should not render Label for an empty stage', async () => {
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc', { ...stages, dhcpFailure: null })}
          colors={colors}
          selectedStage={null}
          onSelectStage={() => {}}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    expect(screen.queryByText('DHCP')).toBe(null)
  })

  it('should update the windowWidth state when the window is resized', () => {
    const mockResizeHandler = jest.fn()
    window.addEventListener('resize', mockResizeHandler)
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc', { ...stages, dhcpFailure: null })}
          colors={colors}
          selectedStage={null}
          onSelectStage={() => {}}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    fireEvent(window, new Event('resize'))
    expect(mockResizeHandler).toHaveBeenCalledTimes(1)
  })
  it('should not render if parent is not ready', () => {
    render(<Labels parentNode={null} enhancedStages={[]} test-id='labels' />)
    expect(screen.queryByTestId('labels')).toBeNull()
  })
  it('should render labels based on screen width and label width', async () => {
    const enhancedStages = [
      {
        idx: 1,
        width: 899,
        endPosition: 899,
        valueFormatter,
        label: defineMessage({ defaultMessage: 'test1' }),
        formattedPct: '',
        pct: 0,
        name: '',
        value: 0
      },
      {
        idx: 2,
        width: 45,
        endPosition: 945,
        valueFormatter,
        label: defineMessage({ defaultMessage: 'test2' }),
        formattedPct: '',
        pct: 0,
        name: '',
        value: 0
      },
      {
        idx: 3,
        width: 1300,
        endPosition: 1180,
        valueFormatter,
        label: defineMessage({ defaultMessage: 'test3' }),
        formattedPct: '',
        pct: 0,
        name: '',
        value: 0
      }
    ]
    const parentNode = { offsetWidth: 1000 }
    const colors = ['black', 'red', 'yellow']
    const props = { enhancedStages, parentNode, parentHeight: 120, colors, onClick: jest.fn() }
    render(
      <Provider>
        <Labels {...props} />
      </Provider>
    )
    expect(await screen.findByText('test3: (0)')).toBeVisible()
  })
  it('should handle onClick', async () => {
    const onClick = jest.fn()
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc',stages )}
          colors={colors}
          selectedStage={'dhcpFailure'}
          onSelectStage={onClick}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    const label = await screen.findByText('802.11 Auth.: 19.32%(228 ms)')
    expect(label).toBeVisible()
    fireEvent.click(label)
    expect(onClick).toBeCalledWith(123.64800000000001, 'Authentication')
  })
  it('closes a stage', async () => {
    const onClick = jest.fn()
    render(
      <Provider>
        <FunnelChart
          valueLabel='Fail'
          height={140}
          stages={getFormattedToFunnel('ttc',stages )}
          colors={colors}
          selectedStage={'Authentication'}
          onSelectStage={onClick}
          valueFormatter={valueFormatter}
        />
      </Provider>
    )
    const label = await screen.findByText('802.11 Auth.: 19.32%(228 ms)')
    expect(label).toBeVisible()
    fireEvent.click(label)
    expect(onClick).toBeCalledWith(123.64800000000001, null)
  })
})
