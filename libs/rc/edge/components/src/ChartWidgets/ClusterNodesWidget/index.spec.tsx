import React from 'react'

import { EdgeStatus, EdgeStatusSeverityEnum } from '@acx-ui/rc/utils'
import { render, screen }                     from '@acx-ui/test-utils'

import { EdgeClusterNodesWidget, getClusterNodesChartData } from './index'

// Mock dependencies
jest.mock('../EdgeOverviewDonutWidget', () => ({
  EdgeOverviewDonutWidget: ({ title, data, isLoading }) => (
    <div data-testid='donut-widget' data-loading={isLoading}>
      <div data-testid='chart-title'>{title}</div>
      <div data-testid='chart-data'>{JSON.stringify(data)}</div>
    </div>)
}))

jest.mock('../../utils/general', () => ({
  getEdgeStatusDisplayName: (label) => `Formatted ${label}`
}))

describe('EdgeClusterNodesWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with loading state', () => {
    render(<EdgeClusterNodesWidget isLoading={true} clusterData={undefined} />)

    expect(screen.getByTestId('donut-widget')).toHaveAttribute('data-loading', 'true')
    expect(screen.getByText('Nodes')).toBeInTheDocument()
  })

  it('should render with data', () => {
    const clusterData = {
      edgeList: [
        { deviceStatusSeverity: EdgeStatusSeverityEnum.OPERATIONAL },
        { deviceStatusSeverity: EdgeStatusSeverityEnum.OPERATIONAL },
        { deviceStatusSeverity: EdgeStatusSeverityEnum.REQUIRES_ATTENTION }
      ] as EdgeStatus[]
    }

    render(<EdgeClusterNodesWidget isLoading={false} clusterData={clusterData} />)

    expect(screen.getByTestId('donut-widget')).toHaveAttribute('data-loading', 'false')

    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '[]')
    expect(chartData.length).toBe(2) // OPERATIONAL and REQUIRES_ATTENTION
    expect(chartData[0].value).toBe(2) // 2 OPERATIONAL nodes
    expect(chartData[1].value).toBe(1) // 1 REQUIRES_ATTENTION node
  })

  it('should render with empty data', () => {
    const clusterData = {
      edgeList: []
    }

    render(<EdgeClusterNodesWidget isLoading={false} clusterData={clusterData} />)

    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent || '[]')
    expect(chartData.length).toBe(0)
  })
})

describe('getClusterNodesChartData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate chart data from node statuses', () => {
    const nodes = [
      { deviceStatusSeverity: EdgeStatusSeverityEnum.OPERATIONAL },
      { deviceStatusSeverity: EdgeStatusSeverityEnum.OPERATIONAL },
      { deviceStatusSeverity: EdgeStatusSeverityEnum.REQUIRES_ATTENTION },
      { deviceStatusSeverity: EdgeStatusSeverityEnum.TRANSIENT_ISSUE },
      { deviceStatusSeverity: EdgeStatusSeverityEnum.OFFLINE },
      { deviceStatusSeverity: EdgeStatusSeverityEnum.IN_SETUP_PHASE }
    ] as EdgeStatus[]

    const result = getClusterNodesChartData(nodes)

    expect(result.length).toBe(5)

    // Check all statuses are properly counted
    // eslint-disable-next-line max-len
    const operationalItem = result.find(item => item.name === `Formatted ${EdgeStatusSeverityEnum.OPERATIONAL}`)
    expect(operationalItem?.value).toBe(2)

    // eslint-disable-next-line max-len
    const requiresAttentionItem = result.find(item => item.name === `Formatted ${EdgeStatusSeverityEnum.REQUIRES_ATTENTION}`)
    expect(requiresAttentionItem?.value).toBe(1)

    // eslint-disable-next-line max-len
    const transientIssueItem = result.find(item => item.name === `Formatted ${EdgeStatusSeverityEnum.TRANSIENT_ISSUE}`)
    expect(transientIssueItem?.value).toBe(1)

    // eslint-disable-next-line max-len
    const offlineItem = result.find(item => item.name === `Formatted ${EdgeStatusSeverityEnum.OFFLINE}`)
    expect(offlineItem?.value).toBe(1)

    // eslint-disable-next-line max-len
    const setupPhaseItem = result.find(item => item.name === `Formatted ${EdgeStatusSeverityEnum.IN_SETUP_PHASE}`)
    expect(setupPhaseItem?.value).toBe(1)
  })

  it('should return empty array for undefined nodes', () => {
    const result = getClusterNodesChartData(undefined)
    expect(result).toEqual([])
  })

  it('should return empty array for empty nodes array', () => {
    const result = getClusterNodesChartData([])
    expect(result).toEqual([])
  })

  it('should only include statuses that are present in the data', () => {
    const nodes = [
      { deviceStatusSeverity: EdgeStatusSeverityEnum.OPERATIONAL },
      { deviceStatusSeverity: EdgeStatusSeverityEnum.OPERATIONAL }
    ] as EdgeStatus[]

    const result = getClusterNodesChartData(nodes)

    expect(result.length).toBe(1)
    expect(result[0].name).toBe(`Formatted ${EdgeStatusSeverityEnum.OPERATIONAL}`)
    expect(result[0].value).toBe(2)
  })
})
