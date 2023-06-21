import '@testing-library/jest-dom'

import { ReportType } from '../mapping/reportsMapping'

import { PageHeaderExtra } from '.'

describe('pageHeaderExtra component', () => {
  it('should render correctly', () => {
    const result = PageHeaderExtra(ReportType.ACCESS_POINT)
    expect(result.props['data-testid']).toEqual('PageHeaderExtra')
  })
})
