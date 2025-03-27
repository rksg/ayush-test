import _ from 'lodash'

import { useAnySplitsOn, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { intentAIUrl, Provider, store, intentAIApi }         from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockIntentContext } from '../__tests__/fixtures'
import { Statuses }          from '../states'
import { IntentDetail }      from '../useIntentDetailsQuery'

import { mockedCRRMGraphs, mockedIntentCRRM, mockedIntentCRRMKPIs, mockedIntentCRRMStatusTrail } from './__tests__/fixtures'
import * as CCrrmChannelAuto                                                                     from './CCrrmChannelAuto'
import { kpis }                                                                                  from './common'

jest.mock('../IntentContext')
jest.mock('./RRMGraph', () => ({
  IntentAIRRMGraph: () => <div data-testid='IntentAIRRMGraph' />,
  SummaryGraphAfter: () => <div data-testid='SummaryGraphAfter' />,
  SummaryGraphBefore: () => <div data-testid='SummaryGraphBefore' />
}))
jest.mock('./RRMGraph/DownloadRRMComparison', () => ({
  DownloadRRMComparison: () => <div data-testid='DownloadRRMComparison' />
}))


export const mockIntentContextWith = (data: Partial<IntentDetail>) => {
  const intent = _.merge({}, mockedIntentCRRM, data) as IntentDetail
  mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail',
    { data: { intent: mockedIntentCRRMStatusTrail } })
  mockGraphqlQuery(intentAIUrl, 'IntentKPIs',
    { data: { intent: mockedIntentCRRMKPIs } })
  const context = mockIntentContext({ intent, kpis })
  return { params: _.pick(context.intent, ['code', 'root', 'sliceId']) }
}

describe('IntentAIDetails', () => {
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())
    mockGraphqlQuery(intentAIUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useAnySplitsOn).mockReturnValue(true)
  })

  it('handle cold tier data retention', async () => {
    jest.mocked(useAnySplitsOn).mockReturnValue(false)
    const { params } = mockIntentContextWith({
      code: 'c-crrm-channel5g-auto',
      dataCheck: {
        isDataRetained: true,
        isHotTierData: false
      },
      status: Statuses.active,
      kpi_number_of_interfering_links: {
        data: {
          timestamp: null,
          result: 0
        },
        compareData: {
          timestamp: '2024-08-14T00:00:00.000Z',
          result: 2
        }
      },
      metadata: {
        preferences: {
          crrmFullOptimization: true
        }
      } as unknown as IntentDetail['metadata']
    })
    render(
      <CCrrmChannelAuto.IntentAIDetails />,
      { route: { params }, wrapper: Provider }
    )

    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()

    const loaders = screen.getAllByRole('img', { name: 'loader' })
    loaders.forEach(loader => expect(loader).toBeVisible())
    const kpiContainers = await screen.findAllByTestId('KPI')
    for (const kpiContainer of kpiContainers) {
      await waitFor(() => {
        expect(kpiContainer)
          .toHaveTextContent('Metrics / Charts unavailable for data beyond 30 days')
      })
    }
  })

  describe('renders correctly', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-07-15T14:15:00.000Z'))
      jest.mocked(useIsSplitOn).mockReturnValue(true)
    })

    async function assertRenderCorrectly () {
      expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
      expect(await screen.findByTestId('IntentAIRRMGraph')).toBeVisible()
      expect(await screen.findByText('Interfering Links')).toBeVisible()
    }

    async function assertRenderCorrectlyLegacy () {
      expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
      expect(await screen.findByTestId('IntentAIRRMGraph')).toBeVisible()
      const details = await screen.findByTestId('Details')
      expect(await within(details).findAllByTestId('KPI')).toHaveLength(1)
    }

    it('handles 2.4 GHz', async () => {
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel24g-auto' })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
    })

    it('handles 5 GHz', async () => {
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel5g-auto' })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
    })

    it('handles 6 GHz', async () => {
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel5g-auto' })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
    })

    it('handles new rrm', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: Statuses.new,
        kpi_number_of_interfering_links: {
          data: {
            timestamp: null,
            result: 0
          },
          compareData: {
            timestamp: '2024-08-14T00:00:00.000Z',
            result: 2
          }
        }
      })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
      expect(screen.getByTestId('IntentAIRRMGraph')).toBeVisible()

      expect(await screen.findByText('IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.')).toBeVisible() // eslint-disable-line max-len

      expect(await screen.findByTestId('Benefits'))
        .toHaveTextContent('Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.') // eslint-disable-line max-len
      expect(await screen.findByTestId('Potential Trade-off'))
        .toHaveTextContent('In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, which could lower overall throughput.') // eslint-disable-line max-len
    })

    it('handles active full rrm', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: Statuses.active,
        kpi_number_of_interfering_links: {
          data: {
            timestamp: null,
            result: 0
          },
          compareData: {
            timestamp: '2024-08-14T00:00:00.000Z',
            result: 2
          }
        },
        metadata: {
          preferences: {
            crrmFullOptimization: true
          }
        } as unknown as IntentDetail['metadata']
      })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
      expect(screen.getByTestId('IntentAIRRMGraph')).toBeVisible()

      expect(await screen.findByText('IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.')).toBeVisible() // eslint-disable-line max-len

      expect(await screen.findByTestId('Benefits'))
        .toHaveTextContent('Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.') // eslint-disable-line max-len
      expect(await screen.findByTestId('Potential Trade-off'))
        .toHaveTextContent('In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, which could lower overall throughput.') // eslint-disable-line max-len
    })

    it('handles active partial rrm', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: Statuses.active,
        kpi_number_of_interfering_links: {
          data: {
            timestamp: null,
            result: 0
          },
          compareData: {
            timestamp: '2024-08-14T00:00:00.000Z',
            result: 2
          }
        },
        metadata: {
          preferences: {
            crrmFullOptimization: false
          }
        } as unknown as IntentDetail['metadata']
      })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()

      expect(await screen.findByText('IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.')).toBeVisible() // eslint-disable-line max-len

      expect(await screen.findByTestId('Benefits'))
        .toHaveTextContent('Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.')  // eslint-disable-line max-len
      expect(await screen.findByTestId('Potential Trade-off'))
        .toHaveTextContent('In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, which could lower overall throughput.') // eslint-disable-line max-len
    })

    it('handles paused rrm', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: Statuses.paused,
        kpi_number_of_interfering_links: {
          data: {
            timestamp: null,
            result: 0
          },
          compareData: {
            timestamp: '2024-08-14T00:00:00.000Z',
            result: 2
          }
        }
      })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
      expect(screen.queryByTestId('IntentAIRRMGraph')).not.toBeInTheDocument()
      expect(screen.queryByTestId('Details')).not.toBeInTheDocument()
      expect(screen.queryByTestId('DownloadRRMComparison')).not.toBeInTheDocument()

      /* eslint-disable max-len */
      expect(await screen.findByText('When activated, this Intent takes over the automatic channel planning in the network.')).toBeVisible()
      expect(screen.queryByTestId('Benefits')).not.toBeInTheDocument()
      expect(screen.queryByTestId('Potential Trade-off')).not.toBeInTheDocument()
    })

    it('handles 2.4 GHz Legacy', async () => {
      jest.mocked(useAnySplitsOn).mockReturnValue(false)
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel24g-auto' })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectlyLegacy()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
    })

    it('handles 5 GHz Legacy', async () => {
      jest.mocked(useAnySplitsOn).mockReturnValue(false)
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel5g-auto' })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectlyLegacy()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
    })

    it('handles 6 GHz Legacy', async () => {
      jest.mocked(useAnySplitsOn).mockReturnValue(false)
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel5g-auto' })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectlyLegacy()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
    })

    it('handles new rrm Legacy', async () => {
      jest.mocked(useAnySplitsOn).mockReturnValue(false)
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: Statuses.new,
        kpi_number_of_interfering_links: {
          data: {
            timestamp: null,
            result: 0
          },
          compareData: {
            timestamp: '2024-08-14T00:00:00.000Z',
            result: 2
          }
        }
      })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectlyLegacy()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
      expect(screen.getByTestId('IntentAIRRMGraph')).toBeVisible()

      expect(await screen.findByText('IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.')).toBeVisible() // eslint-disable-line max-len

      expect(await screen.findByTestId('Benefits'))
        .toHaveTextContent('Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.') // eslint-disable-line max-len
      expect(await screen.findByTestId('Potential Trade-off'))
        .toHaveTextContent('In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, which could lower overall throughput.') // eslint-disable-line max-len
    })

    it('handles active full rrm Legacy', async () => {
      jest.mocked(useAnySplitsOn).mockReturnValue(false)
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: Statuses.active,
        kpi_number_of_interfering_links: {
          data: {
            timestamp: null,
            result: 0
          },
          compareData: {
            timestamp: '2024-08-14T00:00:00.000Z',
            result: 2
          }
        },
        metadata: {
          preferences: {
            crrmFullOptimization: true
          }
        } as unknown as IntentDetail['metadata']
      })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectlyLegacy()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
      expect(screen.getByTestId('IntentAIRRMGraph')).toBeVisible()

      expect(await screen.findByText('IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.')).toBeVisible() // eslint-disable-line max-len

      expect(await screen.findByTestId('Benefits'))
        .toHaveTextContent('Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.') // eslint-disable-line max-len
      expect(await screen.findByTestId('Potential Trade-off'))
        .toHaveTextContent('In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, which could lower overall throughput.') // eslint-disable-line max-len
    })

    it('handles active partial rrm Legacy', async () => {
      jest.mocked(useAnySplitsOn).mockReturnValue(false)
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: Statuses.active,
        kpi_number_of_interfering_links: {
          data: {
            timestamp: null,
            result: 0
          },
          compareData: {
            timestamp: '2024-08-14T00:00:00.000Z',
            result: 2
          }
        },
        metadata: {
          preferences: {
            crrmFullOptimization: false
          }
        } as unknown as IntentDetail['metadata']
      })
      render(
        <CCrrmChannelAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectlyLegacy()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()

      expect(await screen.findByText('IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.')).toBeVisible() // eslint-disable-line max-len

      expect(await screen.findByTestId('Benefits'))
        .toHaveTextContent('Low interference fosters improved throughput, lower latency, better signal quality, stable connections, enhanced user experience, longer battery life, efficient spectrum utilization, optimized channel usage, and reduced congestion, leading to higher data rates, higher SNR, consistent performance, and balanced network load.')  // eslint-disable-line max-len
      expect(await screen.findByTestId('Potential Trade-off'))
        .toHaveTextContent('In the quest for minimizing interference between access points (APs), AI algorithms may opt to narrow channel widths. While this can enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to noise, potentially reducing throughput. Narrow channels limit data capacity, which could lower overall throughput.') // eslint-disable-line max-len
    })
  })
})
