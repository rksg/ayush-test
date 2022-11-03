/* eslint-disable testing-library/no-node-access */
import { dataApiURL }                       from '@acx-ui/analytics/services'
import { AnalyticsFilter }                  from '@acx-ui/analytics/utils'
import { Provider, store }                  from '@acx-ui/store'
import { render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'
import { DateRange }                        from '@acx-ui/utils'

import { topSSIDsByTrafficFixture } from './__tests__/fixtures'
import { api }                      from './services'

import { TopSSIDsByTraffic } from './index'

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

describe('TopSSIDsByTrafficWidget', () => {
  const filters:AnalyticsFilter = {
    startDate: '2022-01-01T00:00:00+08:00',
    endDate: '2022-01-02T00:00:00+08:00',
    path: [{ type: 'network', name: 'Network' }],
    range: DateRange.last24Hours,
    filter: {}
  }

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TopSSIDsByTrafficWidget', {
      data: { network: { hierarchyNode: topSSIDsByTrafficFixture } }
    })
    render( <Provider> <TopSSIDsByTraffic filters={filters}/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render for empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'TopSSIDsByTrafficWidget', {
      data: { network: { hierarchyNode: {
        totalUserTraffic: null,
        topNSSIDByTraffic: []
      } } }
    })
    const { asFragment } = render( <Provider>
      <TopSSIDsByTraffic filters={filters}/>
    </Provider>)
    await screen.findByText('No data to display')
    expect(asFragment()).toMatchSnapshot('NoData')
  })

  it('should render table with sparkline svg', async () => {
    mockGraphqlQuery(dataApiURL, 'TopSSIDsByTrafficWidget', {
      data: { network: { hierarchyNode: topSSIDsByTrafficFixture } }
    })
    const { asFragment } = render( <Provider> <TopSSIDsByTraffic
      filters={filters}/></Provider>)
    await screen.findByText('Top 5 SSIDs by Traffic')
    const tableHeaders = asFragment().querySelector('div > table > thead')
    expect(tableHeaders).toMatchSnapshot('tableHeaders')
    const tableRows = extractRows(asFragment())
    expect(tableRows).toMatchSnapshot('tableRows')
  })

})
