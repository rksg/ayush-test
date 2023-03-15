import userEvent         from '@testing-library/user-event'
import { defineMessage } from 'react-intl'

import { dataApiURL }                                                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                                                  from '@acx-ui/analytics/utils'
import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { BrowserRouter as Router }                                          from '@acx-ui/react-router-dom'
import { Provider, store }                                                  from '@acx-ui/store'
import { render, waitForElementToBeRemoved, screen, mockGraphqlQuery, act } from '@acx-ui/test-utils'
import { DateRange }                                                        from '@acx-ui/utils'

import { OpenType } from '..'

import { fakeSummary, fakeEmptySummary } from './__tests__/fixtures'
import { api }                           from './services'

import { SummaryBoxes, Box } from '.'

describe('box', () => {
  const boxProps = {
    type: 'successCount',
    title: defineMessage({ defaultMessage: 'test box' }),
    suffix: '/suffix',
    value: '100',
    toggleEnable: true
  }
  it('should render correctly with toggle enabled', async () => {
    const onClick = jest.fn()
    const { asFragment } = render(<Box {...boxProps} isOpen onClick={onClick}/>)
    expect(asFragment()).toMatchSnapshot()
    await userEvent.click(screen.getByTestId('CaretDoubleUpOutlined'))
    expect(onClick).toBeCalledTimes(1)
  })

  it('should render correctly with toggle disabled', async () => {
    const onClick = jest.fn()
    const falseToggleBoxProps = { ...boxProps, toggleEnable: false }
    const { asFragment } = render(<Box {...falseToggleBoxProps} isOpen onClick={onClick}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

const filters: AnalyticsFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  path: [{ type: 'network', name: 'Network' }],
  range: DateRange.last24Hours
}

describe('Incidents Page', () => {
  beforeEach(()=>{
    store.dispatch(api.util.resetApiState())
  })
  it('should match snapshot', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
    const openType = 'none'
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes
        filters={filters}
        openType={openType}
        setOpenType={jest.fn()}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('should show - when no data', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeEmptySummary })
    const openType = 'none'
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters}
        openType={openType}
        setOpenType={jest.fn()}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('render when feature toggle is disabled', async () => {
    mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeEmptySummary })
    const openType = 'none'
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const { asFragment } = render(
      <Router><Provider><SummaryBoxes filters={filters}
        openType={openType}
        setOpenType={jest.fn()}
      /></Provider></Router>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  describe('toggle stats', () => {
    it('should handle toggle stats', async () => {
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      let openType: OpenType = 'none'
      const setOpenType = jest.fn((val: typeof openType) => openType = val)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      const { rerender } = render(<Router><Provider><SummaryBoxes
        filters={filters}
        openType={openType}
        setOpenType={setOpenType}
      /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      const downArrows = screen.getAllByTestId('CaretDoubleDownOutlined')
      expect(downArrows).toHaveLength(4)

      await act(async () => await userEvent.click(downArrows[0]))
      rerender(<Router><Provider><SummaryBoxes
        filters={filters}
        openType={openType}
        setOpenType={setOpenType}
      /></Provider></Router>)
      const upArrows = screen.getAllByTestId('CaretDoubleUpOutlined')
      expect(upArrows).toHaveLength(3)

      await act(async () => await userEvent.click(upArrows[0]))
      rerender(<Router><Provider><SummaryBoxes
        filters={filters}
        openType={openType}
        setOpenType={setOpenType}
      /></Provider></Router>)
      expect(screen.getAllByTestId('CaretDoubleDownOutlined')).toHaveLength(4)
    })

    it('should handle toggle ttc', async () => {
      mockGraphqlQuery(dataApiURL, 'HealthSummary', { data: fakeSummary })
      let openType: OpenType = 'none'
      const setOpenType = jest.fn((val: typeof openType) => openType = val)
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      const { rerender } = render(<Router><Provider><SummaryBoxes
        filters={filters}
        openType={openType}
        setOpenType={setOpenType}
      /></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

      expect(screen.getAllByTestId('CaretDoubleDownOutlined')).toHaveLength(4)

      const button = screen.getByRole('button', { name: /time to connect/i })
      await act(async () => await userEvent.click(button))
      rerender(<Router><Provider><SummaryBoxes
        filters={filters}
        openType={openType}
        setOpenType={setOpenType}
      /></Provider></Router>)

      expect(screen.getAllByTestId('CaretDoubleUpOutlined')).toHaveLength(1)

      await act(async () => await userEvent.click(button))
      rerender(<Router><Provider><SummaryBoxes
        filters={filters}
        openType={openType}
        setOpenType={setOpenType}
      /></Provider></Router>)

      expect(screen.getAllByTestId('CaretDoubleDownOutlined')).toHaveLength(4)
    })
  })
})
