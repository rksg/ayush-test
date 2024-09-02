import _ from 'lodash'

import { intentAIUrl, Provider, store, intentAIApi } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, within }  from '@acx-ui/test-utils'

import { useIntentContext } from '../IntentContext'
import { Intent }           from '../useIntentDetailsQuery'

import { mockedCRRMGraphs, mockedIntentCRRM } from './__tests__/fixtures'
import * as CCrrmChannel24gAuto               from './CCrrmChannel24gAuto'
import * as CCrrmChannel5gAuto                from './CCrrmChannel5gAuto'
import * as CCrrmChannel6gAuto                from './CCrrmChannel6gAuto'
import { kpis }                               from './common'

jest.mock('../IntentContext')
jest.mock('./RRMGraph', () => ({
  IntentAIRRMGraph: () => <div data-testid='IntentAIRRMGraph' />,
  SummaryGraphAfter: () => <div data-testid='SummaryGraphAfter' />,
  SummaryGraphBefore: () => <div data-testid='SummaryGraphBefore' />
}))
jest.mock('./RRMGraph/DownloadRRMComparison', () => ({
  DownloadRRMComparison: () => <div data-testid='DownloadRRMComparison' />
}))

const mockIntentContextWith = (data: Partial<Intent>) => {
  let intent = mockedIntentCRRM
  intent = _.merge({}, intent, data) as typeof intent
  jest.mocked(useIntentContext).mockReturnValue({ intent, kpis })
  return {
    params: {
      code: mockedIntentCRRM.code,
      root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
      sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52'
    }
  }
}

describe('IntentAIDetails', () => {
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())
    mockGraphqlQuery(intentAIUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
  })

  it('handle beyond data retention', async () => {
    const { params } = mockIntentContextWith({
      code: 'c-crrm-channel5g-auto',
      status: 'applied',
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
        algorithmData: { isCrrmFullOptimization: true }
      } as unknown as Intent['metadata']
    })
    render(
      <CCrrmChannel5gAuto.IntentAIDetails />,
      { route: { params }, wrapper: Provider }
    )

    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
    expect(await screen.findByTestId('Benefits'))
      .toHaveTextContent('Beyond data retention period')
    expect(await screen.findByTestId('Key Performance Indications'))
      .toHaveTextContent('Beyond data retention period')
  })

  describe('renders correctly', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-07-15T14:15:00.000Z'))
    })

    async function assertRenderCorrectly () {
      expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
      expect(await screen.findByTestId('IntentAIRRMGraph')).toBeVisible()
      expect(await screen.findByTestId('DownloadRRMComparison')).toBeVisible()
      const benefits = await screen.findByTestId('Benefits')
      expect(await within(benefits).findAllByTestId('KPI')).toHaveLength(1)
    }

    it('handle 2.4 GHz', async () => {
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel24g-auto' })
      render(
        <CCrrmChannel24gAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
    })

    it('handle 5 GHz', async () => {
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel5g-auto' })
      render(
        <CCrrmChannel5gAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
    })

    it('handle 6 GHz', async () => {
      const { params } = mockIntentContextWith({ code: 'c-crrm-channel5g-auto' })
      render(
        <CCrrmChannel6gAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
    })

    it('handle new rrm', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: 'new',
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
          algorithmData: { isCrrmFullOptimization: true }
        } as unknown as Intent['metadata']
      })
      render(
        <CCrrmChannel5gAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(await screen.findByTestId('Why the intent?'))
        .toHaveTextContent(/interfering links from 2 to 0/)
    })

    it('handle active full rrm', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: 'applied',
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
          algorithmData: { isCrrmFullOptimization: true }
        } as unknown as Intent['metadata']
      })
      render(
        <CCrrmChannel5gAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(await screen.findByTestId('Why the intent?'))
        .toHaveTextContent(/adjust the channel plan, bandwidth and AP transmit power when necessary to/) // eslint-disable-line max-len
      expect(await screen.findByTestId('Potential trade-off'))
        .toHaveTextContent(/for channel, channel bandwidth, Auto Channel Selection, Auto Cell Sizing and AP transmit power will potentially be overwritten/) // eslint-disable-line max-len
    })

    it('handle active partial rrm', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-crrm-channel5g-auto',
        status: 'applied',
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
          algorithmData: { isCrrmFullOptimization: false }
        } as unknown as Intent['metadata']
      })
      render(
        <CCrrmChannel5gAuto.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(await screen.findByTestId('Why the intent?'))
        .toHaveTextContent(/adjust the channel plan when necessary to/)
      expect(await screen.findByTestId('Potential trade-off'))
        .toHaveTextContent(/for channel and Auto Channel Selection will potentially be overwritten/)
    })
  })
})

