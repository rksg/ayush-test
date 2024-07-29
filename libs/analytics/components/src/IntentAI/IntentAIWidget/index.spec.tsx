import { defaultNetworkPath }                              from '@acx-ui/analytics/utils'
import * as config                                         from '@acx-ui/config'
import { recommendationUrl, Provider, store, intentAIUrl } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'
import { NetworkPath, PathFilter, DateRange } from '@acx-ui/utils'

import { intentHighlights, intentHighlightsWithAirflex, intentHighlightsWithNullFields, intentHighlightsWithOperations, intentHighlightsWithRRM, intentHighlightsWithZeroApplied } from '../__tests__/fixtures'
import { crrmListResult, crrmNoLicenseListResult, crrmUnknownListResult }                                                                                                          from '../Recommendations/__tests__/fixtures'
import { api }                                                                                                                                                                     from '../Recommendations/services'

import { AIDrivenRRM, IntentAIWidget } from '.'

jest.mock('@acx-ui/config')
const get = jest.mocked(config.get)

const pathFilters: PathFilter = {
  startDate: '2022-01-01T00:00:00+08:00',
  endDate: '2022-01-02T00:00:00+08:00',
  range: DateRange.last24Hours,
  path: defaultNetworkPath
}

describe('IntentAI dashboard', () => {
  afterEach(() => {
    get.mockReturnValue('')
  })

  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    // TODO: remove?
    jest.spyOn(require('../Recommendations/utils'), 'isDataRetained')
      .mockImplementation(() => true)
  })

  it('render intentHighlights with full data', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlights
    })

    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('8 Automated recommendations applied.')).toBeVisible()

    expect(await screen.findByText('AirFlexAI')).toBeVisible()
    expect(await screen.findByText('10 Automated recommendations applied.')).toBeVisible()

    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findByText('12 Automated recommendations applied.')).toBeVisible()
  })

  it('render texts when intentHighlights have zero applied data', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithZeroApplied
    })

    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('AirFlexAI')).toBeVisible()
    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findAllByText('Click here to view available Intents in the network.'))
      .toHaveLength(3)
  })

  it('render no data when all fields are null in intentHighlights', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithNullFields
    })

    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('No Data')).toBeVisible()
    expect(screen.queryByText('AI-Driven RRM')).toBeNull()
    expect(screen.queryByText('AirFlexAI')).toBeNull()
    expect(screen.queryByText('AI Operations')).toBeNull()
  })

  it('render RRM data when intentHighlights only have RRM fields', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithRRM
    })
    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(screen.queryByText('AirFlexAI')).toBeNull()
    expect(screen.queryByText('AI Operations')).toBeNull()
  })

  it('render AirFlex data when intentHighlights only have AirFlex fields', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithAirflex
    })
    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AirFlexAI')).toBeVisible()
    expect(screen.queryByText('AI-Driven RRM')).toBeNull()
    expect(screen.queryByText('AI Operations')).toBeNull()
  })

  it('render AI operation data when intentHighlights only have AI operation fields', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithOperations
    })
    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(screen.queryByText('AI-Driven RRM')).toBeNull()
    expect(screen.queryByText('AirFlexAI')).toBeNull()
  })

})
