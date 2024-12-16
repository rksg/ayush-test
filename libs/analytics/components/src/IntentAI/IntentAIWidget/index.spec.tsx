import userEvent from '@testing-library/user-event'

import { defaultNetworkPath }           from '@acx-ui/analytics/utils'
import * as config                      from '@acx-ui/config'
import { Provider, store, intentAIUrl } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  render,
  screen
} from '@acx-ui/test-utils'
import { PathFilter, DateRange } from '@acx-ui/utils'

import {
  intentHighlights,
  intentHighlightsWithNullFields,
  intentHighlightsWithRRM,
  intentHighlightsWithEquiFlex,
  intentHighlightsWithOperations,
  intentHighlightsWithZeroActive
} from '../__tests__/fixtures'
import { api } from '../services'

import IntentAIWidget from '.'

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
  })

  it('render intentHighlights with full data', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlights
    })

    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('8 Intents are active.')).toBeVisible()

    expect(await screen.findByText('EquiFlex')).toBeVisible()
    expect(await screen.findByText('10 Intents are active.')).toBeVisible()

    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(await screen.findByText('12 Intents are active.')).toBeVisible()
  })

  it('render texts when intentHighlights have zero applied data', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithZeroActive
    })

    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(await screen.findByText('EquiFlex')).toBeVisible()
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
    expect(screen.queryByText('EquiFlex')).toBeNull()
    expect(screen.queryByText('AI Operations')).toBeNull()
  })

  it('render RRM data when intentHighlights only have RRM fields', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithRRM
    })
    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI-Driven RRM')).toBeVisible()
    expect(screen.queryByText('EquiFlex')).toBeNull()
    expect(screen.queryByText('AI Operations')).toBeNull()
    const linkElm = await screen.findByRole('link', { name: /Intents/ })
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('intentTableFilters='))
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('AI-Driven'))
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('active'))
  })

  it('render EquiFlex data when intentHighlights only have EquiFlex fields', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithEquiFlex
    })
    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('EquiFlex')).toBeVisible()
    expect(screen.queryByText('AI-Driven RRM')).toBeNull()
    expect(screen.queryByText('AI Operations')).toBeNull()
    const linkElm = await screen.findByRole('link', { name: /Intents/ })
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('intentTableFilters='))
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('EquiFlex'))
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('active'))
  })

  it('render AI operation data when intentHighlights only have AI operation fields', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithOperations
    })
    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(screen.queryByText('AI-Driven RRM')).toBeNull()
    expect(screen.queryByText('EquiFlex')).toBeNull()
    const linkElm = await screen.findByRole('link', { name: /Intents/ })
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('intentTableFilters='))
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('Operations'))
    expect(linkElm).toHaveAttribute('href', expect.stringContaining('active'))
  })

  it('render AI operation data hover the icon', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentHighlight', {
      data: intentHighlightsWithOperations
    })
    render(<IntentAIWidget pathFilters={pathFilters} />, { route: true, wrapper: Provider })

    expect(await screen.findByText('AI Operations')).toBeVisible()
    expect(screen.queryByText('AI-Driven RRM')).toBeNull()
    expect(screen.queryByText('EquiFlex')).toBeNull()
    expect(screen.queryAllByRole('link')).toHaveLength(2)
    const iconElm = await screen.findByTestId('AIOperation')
    expect(iconElm).toBeVisible()
    await userEvent.hover(iconElm)
    expect(await screen.findByRole('tooltip', { hidden: true })).toContainHTML('AI Operations')
  })

})
