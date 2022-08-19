/* eslint-disable testing-library/no-node-access */
import { dataApiURL }                                                 from '@acx-ui/analytics/services'
import { AnalyticsFilter }                                            from '@acx-ui/analytics/utils'
import { Provider, store }                                            from '@acx-ui/store'
import { fireEvent, render, screen, mockAutoSizer, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                                                  from '@acx-ui/utils'

import { trafficByApplicationFixture } from '../../__tests__/fixtures'

import { api } from './services'

import { TrafficByApplicationWidget } from './index'

type ColumnElements = Array<HTMLElement|SVGSVGElement>

const extractRows = (doc:DocumentFragment)=>{
  const rows: Array<ColumnElements>=[]
  doc.querySelectorAll('table > tbody > tr').forEach((row) => {
    const columns = row.querySelectorAll('td')
    const extractedColumns: ColumnElements = []
    columns.forEach((column,colIndex)=>{
      if(colIndex === 2){
        const svgElement = column.querySelector('svg')
        if(svgElement)
          extractedColumns.push(svgElement)
      }else{
        extractedColumns.push(column)
      }
    })
    rows.push(extractedColumns)
  })
  return rows
}

describe('TrafficByApplicationWidget', () => {
  mockAutoSizer()
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours
  }

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TrafficByApplicationWidget', {
      data: { network: { hierarchyNode: trafficByApplicationFixture } }
    })
    render( <Provider> <TrafficByApplicationWidget filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render table with sparkline svg', async () => {
    mockGraphqlQuery(dataApiURL, 'TrafficByApplicationWidget', {
      data: { network: { hierarchyNode: trafficByApplicationFixture } }
    })
    const { asFragment } =render( <Provider> <TrafficByApplicationWidget
      filters={filters}/></Provider>)
    await screen.findByText('Top 5 Applications by Traffic')
    const contentSwitcher = asFragment()
      .querySelector('div.ant-card-body > div > div:nth-child(1) > div')
    expect(contentSwitcher).toMatchSnapshot('contentSwitcher')
    const tableHeaders = asFragment().querySelector('div > table > thead')
    expect(tableHeaders).toMatchSnapshot('tableHeaders')
    const uploadRows = extractRows(asFragment())
    expect(uploadRows).toMatchSnapshot('uploadRows')
    fireEvent.click(screen.getByText('Download'))
    const downloadRows = extractRows(asFragment())
    expect(downloadRows).toMatchSnapshot('downloadRows')
  })

})
