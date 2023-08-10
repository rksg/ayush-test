import { waitFor } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import moment      from 'moment-timezone'

import { render, screen } from '@acx-ui/test-utils'
import { DateRange }      from '@acx-ui/utils'

import { KPIFilterProvider, KPIFilterContext, ConfigChangeProvider, ConfigChangeContext } from './context'

describe('KPIFilterProvider', () => {
  it('should render', async () => {
    render(
      <KPIFilterProvider>
        <KPIFilterContext.Consumer>
          {(context) => <>
            <div data-testid='kpi'>{context.kpiFilter.join(', ')}</div>
            <div data-testid='add' onClick={()=>context.setKpiFilter('kpikey1')}/>
            <div data-testid='apply' onClick={()=>context.applyKpiFilter(['kpikey2', 'kpikey3'])}/>
          </>}
        </KPIFilterContext.Consumer>
      </KPIFilterProvider>
    )
    expect(await screen.findByTestId('kpi')).toBeVisible()

    userEvent.click(await screen.findByTestId('add'))
    await waitFor(async () =>
      expect(await screen.findByTestId('kpi')).toHaveTextContent('kpikey1'))

    userEvent.click(await screen.findByTestId('apply'))
    await waitFor(async () =>
      expect(await screen.findByTestId('kpi')).toHaveTextContent('kpikey2, kpikey3'))

    userEvent.click(await screen.findByTestId('add'))
    await waitFor(async () =>
      expect(await screen.findByTestId('kpi')).toHaveTextContent('kpikey2, kpikey3, kpikey1'))

    userEvent.click(await screen.findByTestId('add'))
    await waitFor(async () =>
      expect(await screen.findByTestId('kpi')).toHaveTextContent('kpikey2, kpikey3'))
  })
})

describe('ConfigChangeProvider', () => {
  const timezone = 'UTC'
  beforeEach(() => {
    moment.tz.setDefault(timezone)
    Date.now = jest.fn(() => new Date('2022-10-15T00:00:00.000Z').getTime())
  })
  afterEach(() => {
    moment.tz.setDefault(moment.tz.guess())
  })
  it('should render', async () => {
    render(
      <ConfigChangeProvider dateRange={DateRange.last30Days} setDateRange={jest.fn()}>
        <ConfigChangeContext.Consumer>
          {({ dateRange, timeRanges, kpiTimeRanges }) => <>
            <div data-testid='date'>{dateRange}</div>
            <div data-testid='time'>{timeRanges.flatMap(t => t.format()).join(', ')}</div>
            <div data-testid='kpitime'>{
              kpiTimeRanges.flat().map(t => moment(t).format()).join(', ')
            }</div>
          </>}
        </ConfigChangeContext.Consumer>
      </ConfigChangeProvider>
    )
    expect(await screen.findByTestId('date'))
      .toHaveTextContent('Last 30 Days')
    expect(await screen.findByTestId('time'))
      .toHaveTextContent('2022-09-15T00:00:00Z, 2022-10-15T00:00:59Z')
    expect(await screen.findByTestId('kpitime')).toHaveTextContent(
      '2022-09-15T00:00:00Z, 2022-09-16T00:00:00Z, 2022-10-14T00:00:59Z, 2022-10-15T00:00:59Z')
  })
})
