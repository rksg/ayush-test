import { render, screen } from '@acx-ui/test-utils'

import { Score } from './Score'

import { ConfigStatusEnum, getExecutionSectionData } from '.'

describe('Score', () => {
  it('should render correctly', () => {
    const data = {
      testedAps: 100,
      successAps: 22,
      failureAps: 8,
      errorAps: 60
    } as unknown as ReturnType<typeof getExecutionSectionData>
    render(<Score details={data}/>)
    expect(screen.queryByText('APs Under Test')).toBeVisible()
    expect(screen.queryByText('100')).toBeVisible()
    expect(screen.queryByText('Pass')).toBeVisible()
    expect(screen.queryByText('22')).toBeVisible()
    expect(screen.queryByText('Fail')).toBeVisible()
    expect(screen.queryByText('8')).toBeVisible()
    expect(screen.queryByText('Error')).toBeVisible()
    expect(screen.queryByText('60')).toBeVisible()
  })
  it('should handle empty data', () => {
    const data = {
      testedAps: undefined,
      successAps: undefined,
      failureAps: undefined,
      errorAps: undefined
    } as unknown as ReturnType<typeof getExecutionSectionData>
    render(<Score details={data}/>)
    expect(screen.queryByText('APs Under Test')).toBeVisible()
    expect(screen.queryByText('Pass')).toBeVisible()
    expect(screen.queryByText('Fail')).toBeVisible()
    expect(screen.queryByText('Error')).toBeVisible()
    expect(screen.queryAllByText('0')).toHaveLength(4)
  })
  it('should handle no data', () => {
    const data = {
      configured: {
        testedAps: ConfigStatusEnum.NoData,
        successAps: ConfigStatusEnum.NoData,
        failureAps: ConfigStatusEnum.NoData,
        errorAps: ConfigStatusEnum.NoData
      },
      testedAps: undefined,
      successAps: undefined,
      failureAps: undefined,
      errorAps: undefined
    } as unknown as ReturnType<typeof getExecutionSectionData>
    render(<Score details={data}/>)
    expect(screen.queryByText('APs Under Test')).toBeVisible()
    expect(screen.queryByText('Pass')).toBeVisible()
    expect(screen.queryByText('Fail')).toBeVisible()
    expect(screen.queryByText('Error')).toBeVisible()
    expect(screen.queryAllByText('--')).toHaveLength(4)
  })
})
