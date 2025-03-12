import { defaultNetworkPath }                 from '@acx-ui/analytics/utils'
import * as config                            from '@acx-ui/config'
import { recommendationUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { NetworkPath, PathFilter, DateRange } from '@acx-ui/utils'

import { crrmListResult, crrmNoLicenseListResult, crrmUnknownListResult } from '../Recommendations/__tests__/fixtures'
import { api }                                                            from '../Recommendations/services'

import { AIDrivenRRM } from '.'

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

const pathFilters: PathFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath
}

describe('AIDrivenRRM dashboard', () => {
  afterEach(() => {
    get.mockReturnValue('')
  })

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    jest.spyOn(require('../Recommendations/utils'), 'isDataRetained')
      .mockImplementation(() => true)
  })

  it('renders recommendation', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: crrmListResult })
    mockGraphqlQuery(recommendationUrl, 'CrrmKpi', {
      data: { recommendation: { ...crrmListResult.recommendations[0], dataEndTime: '' } }
    })

    render(<AIDrivenRRM pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('3')).toBeVisible()
    expect(await screen.findByText('zone-1')).toBeVisible()
    expect(await screen.findByText('zone-2')).toBeVisible()
    expect(await screen.findByText('Deeps Place')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('There are 3 recommendations for 3 zones covering 13.9K possible RRM combinations. Currently, 1 zone is optimized.')).toBeVisible()

    expect(await screen.findAllByText('From 3 to 0 interfering links')).not.toHaveLength(0)
  })
  it('renders recommendation with second crrmkpi', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: crrmListResult })
    mockGraphqlQuery(recommendationUrl, 'CrrmKpi', {
      data: { recommendation: { ...crrmListResult.recommendations[1], dataEndTime: '' } }
    })

    render(<AIDrivenRRM pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findAllByText('Reverted')).not.toHaveLength(0)
  })
  it('renders recommendation with third crrmkpi', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: crrmListResult })
    mockGraphqlQuery(recommendationUrl, 'CrrmKpi', {
      data: { recommendation: { ...crrmListResult.recommendations[2], dataEndTime: '' } }
    })

    render(<AIDrivenRRM pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findAllByText('2 interfering links can be optimized to 0'))
      .not.toHaveLength(0)
  })
  it('renders unknown recommendations', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: crrmUnknownListResult })
    mockGraphqlQuery(recommendationUrl, 'CrrmKpi', {
      data: { recommendation: { ...crrmUnknownListResult.recommendations[0], dataEndTime: '' } }
    })

    render(<AIDrivenRRM pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('3')).toBeVisible()
    expect(await screen.findByText('zone-1')).toBeVisible()
    expect(await screen.findAllByText('From 3 to 0 interfering links')).not.toHaveLength(0)
    expect(await screen.findByText('zone-2')).toBeVisible()
    expect(await screen.findByText('Deeps Place')).toBeVisible()
    expect(await screen.findByText('zone-3')).toBeVisible()
    expect(await screen.findByText('Insufficient Licenses')).toBeVisible()
    expect(await screen.findByText('zone-4')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('There are 3 recommendations for 3 zones covering 13.9K possible RRM combinations. Currently, 1 zone is optimized.')).toBeVisible()
  })
  it('renders unknown recommendations with second crrmKpi', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: crrmUnknownListResult })
    mockGraphqlQuery(recommendationUrl, 'CrrmKpi', {
      data: { recommendation: { ...crrmUnknownListResult.recommendations[1], dataEndTime: '' } }
    })
    render(<AIDrivenRRM pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findAllByText('Reverted')).not.toHaveLength(0)
    expect(await screen.findByText('Insufficient Licenses')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('There are 3 recommendations for 3 zones covering 13.9K possible RRM combinations. Currently, 1 zone is optimized.')).toBeVisible()
  })
  it('renders unknown only', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', {
      data: {
        crrmCount: 0,
        zoneCount: 0,
        optimizedZoneCount: 0,
        crrmScenarios: 0,
        recommendations: crrmUnknownListResult.recommendations.filter(row => row.code === 'unknown')
      }
    })

    render(<AIDrivenRRM pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(screen.queryByText('No Data')).toBeNull()
    expect(screen.queryByText(
      'Currently RUCKUS AI cannot provide RRM optimizations as zones are not found on your network.'
    )).toBeNull()

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('0')).toBeVisible()
    expect(await screen.findByText('Deeps Place')).toBeVisible()
    expect(await screen.findByText('zone-3')).toBeVisible()
    expect(await screen.findByText('zone-4')).toBeVisible()
    expect(await screen.findByText('Insufficient Licenses')).toBeVisible()
    expect(await screen.findAllByText('Verification Error')).toHaveLength(2)

    // eslint-disable-next-line max-len
    expect(await screen.findByText('There are 0 recommendations for 0 zones covering 0 possible RRM combinations. Currently, 0 zones are optimized.')).toBeVisible()
  })
  it('renders no data for switch path', async () => {
    get.mockReturnValue('true')
    const switchPathFilters = {
      ...pathFilters,
      path: [
        { type: 'network', name: 'Network' },
        { type: 'system', name: 's1' },
        { type: 'switchGroup', name: 'sg1' }
      ] as NetworkPath
    }
    render(<AIDrivenRRM pathFilters={switchPathFilters} />, {
      route: true,
      wrapper: Provider
    })

    expect(await screen.findByText('No Data')).toBeVisible()
    expect(await screen.findByText(
      'Currently RUCKUS AI cannot provide RRM optimizations as zones are not found on your network.'
    )).toBeVisible()
  })
  it('handles no zones', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', {
      data: {
        crrmCount: 0,
        zoneCount: 0,
        optimizedZoneCount: 0,
        crrmScenarios: 0,
        recommendations: []
      }
    })
    render(<AIDrivenRRM pathFilters={pathFilters} />, {
      route: true,
      wrapper: Provider
    })
    expect(await screen.findByText('No Data')).toBeVisible()
    expect(await screen.findByText(
      'Currently RUCKUS AI cannot provide RRM optimizations as zones are not found on your network.'
    )).toBeVisible()
  })
  it('handles no licenses', async () => {
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: crrmNoLicenseListResult })

    render(<AIDrivenRRM pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Update My Licenses')).toBeVisible()
  })
  it('should handle when data retention period passed', async () => {
    const spy = jest.spyOn(require('../Recommendations/utils'), 'isDataRetained')
      .mockImplementation(() => false)
    mockGraphqlQuery(recommendationUrl, 'CrrmList', { data: crrmListResult })
    mockGraphqlQuery(recommendationUrl, 'CrrmKpi', {
      data: { recommendation: { ...crrmListResult.recommendations[0], dataEndTime: 'dataEndTime' } }
    })
    render(<AIDrivenRRM pathFilters={pathFilters} />, { route: true, wrapper: Provider })
    expect(await screen.findAllByText('Beyond data retention period')).not.toHaveLength(0)
    expect(spy).toBeCalledWith('dataEndTime')
  })
})
