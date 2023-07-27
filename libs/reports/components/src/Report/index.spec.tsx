import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ReportType } from '../mapping/reportsMapping'


import { Report } from './index'

jest.mock('./ReportHeader', () => ({
  ReportHeader: () => <div data-testid='reportHeader' />
}))
jest.mock('./EmbeddedReport', () => ({
  //...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid='reportPage' />
}))

describe('Report', () => {
  const params = { tenantId: 'tenant-id' }

  it('should render the report with Header', async () => {
    render(
      <Provider>
        <Report type={ReportType.ACCESS_POINT} withHeader/>
      </Provider>, { route: { params } })
    expect(await screen.findByTestId('reportHeader')).toBeTruthy()
    expect(await screen.findByTestId('reportPage')).toBeTruthy()
  })

  it('should render the report without Header', async () => {
    render(
      <Provider>
        <Report type={ReportType.OVERVIEW} withHeader={false}/>
      </Provider>, { route: { params } })
    expect(await screen.findByTestId('reportPage')).toBeTruthy()
    expect(screen.queryByTestId('reportHeader')).toBeFalsy()
  })
})
