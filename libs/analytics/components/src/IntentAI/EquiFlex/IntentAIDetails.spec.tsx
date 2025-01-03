import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { get }                                                           from '@acx-ui/config'
import { useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import { networkApi }                                                    from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                                from '@acx-ui/rc/utils'
import { Provider, store, intentAIApi, intentAIUrl }                     from '@acx-ui/store'
import { mockGraphqlQuery, mockServer, render, screen, within, waitFor } from '@acx-ui/test-utils'

import { mockIntentContext } from '../__tests__/fixtures'
import {
  Statuses,
  StatusReasons,
  DisplayStates
} from '../states'
import { IntentDetail } from '../useIntentDetailsQuery'

import { mockedIntentEquiFlex, mockedIntentEquiFlexKPIs, mockedIntentEquiFlexStatusTrail, mockWifiNetworkList } from './__tests__/fixtures'
import { configuration, kpis }                                                                                  from './common'
import * as CProbeFlex24g                                                                                       from './CProbeFlex24g'
import * as CProbeFlex5g                                                                                        from './CProbeFlex5g'
import * as CProbeFlex6g                                                                                        from './CProbeFlex6g'

jest.mock('../IntentContext')
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = get as jest.Mock

const mockIntentContextWith = (data: Partial<IntentDetail> = {}) => {
  mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail',
    { data: { intent: mockedIntentEquiFlexStatusTrail } })
  mockGraphqlQuery(intentAIUrl, 'IntentKPIs',
    { data: { intent: mockedIntentEquiFlexKPIs } })

  const intent = _.merge({}, mockedIntentEquiFlex, data) as IntentDetail
  const context = mockIntentContext({ intent, configuration, kpis })
  return {
    params: _.pick(context.intent, ['code', 'root', 'sliceId']),
    metadata: context.intent.metadata
  }
}

describe('IntentAIDetails', () => {
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())

    store.dispatch(networkApi.util.resetApiState())
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getWifiNetworksList.url,
        (_, res, ctx) => res(ctx.json(mockWifiNetworkList))
      )
    )
  })

  it('handle cold tier data', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { params } = mockIntentContextWith({
      code: 'c-probeflex-5g',
      status: Statuses.active,
      dataCheck: {
        isHotTierData: false,
        isDataRetained: true
      }
    })
    render(
      <CProbeFlex5g.IntentAIDetails />,
      { route: { params }, wrapper: Provider }
    )

    expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()

    const loaders = screen.getAllByRole('img', { name: 'loader' })
    loaders.forEach(loader => expect(loader).toBeVisible())
    const kpiContainers = await screen.findAllByTestId('KPI')
    for (const kpiContainer of kpiContainers) {
      await waitFor(() => {
        expect(kpiContainer).toHaveTextContent(
          'Metrics / Charts unavailable for data beyond 30 days')
      })
    }
  })

  describe('renders correctly', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-07-15T14:15:00.000Z'))
      mockGet.mockReturnValue('true') // get('IS_MLISA_SA')
    })

    async function assertRenderCorrectly () {
      expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()

      expect(await screen.findByTestId('Benefits'))
        .toHaveTextContent(/ML based probe responses in Wi-Fi network, dynamically manage/)
      expect(await screen.findByTestId('Potential Trade-off'))
        // eslint-disable-next-line max-len
        .toHaveTextContent(/include increased complexity in network management, potential delays in connecting lesser-priority devices/)
      expect(await screen.findByTestId('Status Trail')).toBeVisible()

      const details = await screen.findByTestId('Details')
      expect(await within(details).findAllByTestId('Configuration')).toHaveLength(1)
      expect(await within(details).findAllByTestId('KPI')).toHaveLength(1)

      await userEvent.hover(await screen.findByTestId('InformationSolid'))
      expect(await screen.findByRole('tooltip', { hidden: true }))
        // eslint-disable-next-line max-len
        .toHaveTextContent('Enabling EquiFlex will disable Airtime Decongestion')
    }

    it('handle 2.4 GHz for EquiFlex', async () => {
      const { params } = mockIntentContextWith({ code: 'c-probeflex-24g' })
      render(
        <CProbeFlex24g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
    })

    it('handle 5 GHz for EquiFlex', async () => {
      const { params } = mockIntentContextWith({ code: 'c-probeflex-5g' })
      render(
        <CProbeFlex5g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
    })

    it('handle 6 GHz for EquiFlex', async () => {
      const { params } = mockIntentContextWith({ code: 'c-probeflex-6g' })
      render(
        <CProbeFlex6g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
    })

    it('handle active EquiFlex with currentValue is enabled', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-probeflex-5g',
        status: Statuses.applyScheduled,
        currentValue: true
      })
      render(
        <CProbeFlex5g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(await screen.findByTestId('Overview text'))
        // eslint-disable-next-line max-len
        .toHaveTextContent('Leverage EquiFlex, available only through IntentAI for intelligent handling of probe request/response and optimize management traffic in a dense network. For improved performance, this option will disable the Air Time Decongestion (ATD) feature if previously enabled for this network.')
    })

    it('handle active EquiFlex with currentValue is not enabled', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-probeflex-5g',
        status: Statuses.applyScheduled,
        currentValue: false
      })
      render(
        <CProbeFlex5g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(await screen.findByTestId('Overview text'))
        // eslint-disable-next-line max-len
        .toHaveTextContent('Leverage EquiFlex, available only through IntentAI for intelligent handling of probe request/response and optimize management traffic in a dense network. For improved performance, this option will disable the Air Time Decongestion (ATD) feature if previously enabled for this network.')
    })

    it('handle inactive EquiFlex', async () => {
      const { params } = mockIntentContextWith({
        code: 'c-probeflex-5g',
        status: Statuses.na,
        statusReason: StatusReasons.notEnoughData,
        displayStatus: DisplayStates.naNotEnoughData
      })
      render(
        <CProbeFlex5g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
      expect(screen.queryByTestId('Benefits')).not.toBeInTheDocument()
      expect(screen.queryByTestId('Potential Trade-off')).not.toBeInTheDocument()
      expect(await screen.findByTestId('Status Trail')).toBeVisible()
      expect(await screen.findByTestId('Current Status')).toBeVisible()
      expect(await screen.findByText('No recommendation was generated. Reason:')).toBeVisible()

      expect(await screen.findByTestId('Overview text'))
        // eslint-disable-next-line max-len
        .toHaveTextContent(/When activated, this Intent takes over the automatic probe request/)
    })

    it('handle EquiFlex without wlans', async () => {
      const { params } = mockIntentContextWith({ code: 'c-probeflex-5g' })
      render(
        <CProbeFlex5g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(screen.queryByText('Networks')).toBeNull()
    })

    it('handle EquiFlex with wlans in RAI', async () => {
      mockGet.mockReturnValue('true') // get('IS_MLISA_SA')
      const { params, metadata } = mockIntentContextWith({
        code: 'c-probeflex-5g',
        metadata: {
          wlans: mockWifiNetworkList.data
        } as IntentDetail['metadata']
      })
      render(
        <CProbeFlex5g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(await screen.findByText(`${metadata.wlans?.length} networks selected`)).toBeVisible()
    })

    it('handle EquiFlex with wlans in R1', async () => {
      mockGet.mockReturnValue('false') // get('IS_MLISA_SA')
      const { params, metadata } = mockIntentContextWith({
        code: 'c-probeflex-5g',
        metadata: {
          wlans: mockWifiNetworkList.data
        } as IntentDetail['metadata']
      })
      render(
        <CProbeFlex5g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(await screen.findByText(`${metadata.wlans?.length} networks selected`)).toBeVisible()
    })

    it('should render loaders seperately', async () => {
      const { params } = mockIntentContextWith({ code: 'c-probeflex-5g' })
      render(
        <CProbeFlex5g.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
      expect(screen.queryByTestId('IntentAIRRMGraph')).not.toBeInTheDocument()
      const loaders = screen.getAllByRole('img', { name: 'loader' })
      loaders.forEach(loader => expect(loader).toBeVisible())
      const details = await screen.findByTestId('Details')
      expect(await within(details).findAllByTestId('KPI')).toHaveLength(1)
    })
  })
})

