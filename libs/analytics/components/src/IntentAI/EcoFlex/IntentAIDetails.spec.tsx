import _ from 'lodash'

import { Provider, store, intentAIApi, intentAIUrl } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen }          from '@acx-ui/test-utils'

import { mockIntentContext } from '../__tests__/fixtures'
import {
  Statuses,
  StatusReasons,
  DisplayStates
} from '../states'
import { IntentDetail } from '../useIntentDetailsQuery'

import { mockedIntentEcoFlex, mockedIntentEcoFlexStatusTrail } from './__tests__/fixtures'
import { mockKpiData }                                         from './__tests__/mockedEcoFlex'
import { configuration, kpis }                                 from './common'
import * as EcoFlex                                            from './IEcoFlex'

jest.mock('../IntentContext')

const mockIntentContextWith = (data: Partial<IntentDetail> = {}) => {
  mockGraphqlQuery(intentAIUrl, 'IntentStatusTrail',
    { data: { intent: mockedIntentEcoFlexStatusTrail } })
  const intent = _.merge({}, mockedIntentEcoFlex, data) as IntentDetail
  const context = mockIntentContext({ intent, configuration, kpis })
  return {
    params: _.pick(context.intent, ['code', 'root', 'sliceId'])
  }
}

describe('IntentAIDetails', () => {
  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())
  })

  // it('handle beyond data retention', async () => {
  //   const { params } = mockIntentContextWith({
  //     code: 'i-ecoflex',
  //     status: Statuses.active
  //   })
  //   render(
  //     <EcoFlex.IntentAIDetails />,
  //     { route: { params }, wrapper: Provider }
  //   )

  //   expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()
  //   expect(await screen.findByTestId('Benefits'))
  //     .toHaveTextContent('Beyond data retention period')
  // })

  describe('renders correctly', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(+new Date('2023-07-15T14:15:00.000Z'))
      mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
        data: { intent: mockKpiData }
      })
    })

    async function assertRenderCorrectly () {
      expect(await screen.findByRole('heading', { name: 'Intent Details' })).toBeVisible()

      expect(await screen.findByTestId('Benefits'))
        .toHaveTextContent(/intelligent PowerSave modes for access points during off-peak hours/)
      expect(await screen.findByTestId('Potential Trade-off'))
        .toHaveTextContent(/Energy Saving enabled network will operate in reduced capacity during/)
      expect(await screen.findByTestId('Status Trail')).toBeVisible()
    }

    it('handle EcoFlex', async () => {
      const { params } = mockIntentContextWith({ code: 'i-ecoflex' })
      render(
        <EcoFlex.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()
    })

    it('handle active EquiFlex', async () => {
      const { params } = mockIntentContextWith({
        code: 'i-ecoflex',
        status: Statuses.applyScheduled
      })
      render(
        <EcoFlex.IntentAIDetails />,
        { route: { params }, wrapper: Provider }
      )

      await assertRenderCorrectly()

      expect(await screen.findByTestId('Overview text'))
        // eslint-disable-next-line max-len
        .toHaveTextContent(/In this mode, based on the usage pattern PowerSave supported APs are switched to PowerSaving mode/)
    })

    it('handle inactive EquiFlex', async () => {
      const { params } = mockIntentContextWith({
        code: 'i-ecoflex',
        status: Statuses.na,
        statusReason: StatusReasons.notEnoughData,
        displayStatus: DisplayStates.naNotEnoughData
      })
      render(
        <EcoFlex.IntentAIDetails />,
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
        .toHaveTextContent(/When activated, this Intent takes over the automatic energy saving in the network/)
    })

  })
})

