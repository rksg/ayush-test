/* eslint-disable testing-library/no-node-access */
import { dataApiURL }                                  from '@acx-ui/analytics/services'
import { Provider, store }                             from '@acx-ui/store'
import { fireEvent, render, screen, mockGraphqlQuery } from '@acx-ui/test-utils'

import { fixture1 } from './fixtures'
import { api }      from './services'

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

  beforeEach(() =>
    store.dispatch(api.util.resetApiState())
  )

  it('should render loader', () => {
    mockGraphqlQuery(dataApiURL, 'TrafficByApplicationWidget', {
      data: { network: { hierarchyNode: fixture1 } }
    })
    render( <Provider> <TrafficByApplicationWidget/></Provider>)
    expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
  })

  it('should render table with sparkline svg', async () => {
    mockGraphqlQuery(dataApiURL, 'TrafficByApplicationWidget', {
      data: { network: { hierarchyNode: fixture1 } }
    })
    const { asFragment } =render( <Provider> <TrafficByApplicationWidget/></Provider>)
    await screen.findByText('Top 5 Applications by Traffic')
    const contentToggle = asFragment().querySelector('div.ant-card-body > div:nth-child(1)')
    expect(contentToggle).toMatchSnapshot('contentToggle')
    const tableHeaders = asFragment().querySelector('div > table > thead')
    expect(tableHeaders).toMatchSnapshot('tableHeaders')
    const uploadRows = extractRows(asFragment())
    expect(uploadRows).toMatchSnapshot('uploadRows')
    fireEvent.click(screen.getByText('Download'))
    const downloadRows = extractRows(asFragment())
    expect(downloadRows).toMatchSnapshot('downloadRows')
  })

})
