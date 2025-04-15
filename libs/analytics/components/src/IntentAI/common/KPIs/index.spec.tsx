import { TrendTypeEnum }                    from '@acx-ui/analytics/utils'
import { intentAIUrl, Provider as wrapper } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { mockIntentContext }                      from '../../__tests__/fixtures'
import { mockedIntentCRRM, mockedIntentCRRMKPIs } from '../../AIDrivenRRM/__tests__/fixtures'
import { kpis }                                   from '../../AIDrivenRRM/common'

import { KPICard, KPIFields, KPIGrid } from '.'

jest.mock('../../IntentContext')

describe('KPICard', () => {
  it('should render correctly with valid data', async () => {
    const mockedKPI = {
      key: 'number-of-interfering-links',
      label: {
        id: '0sjMxu',
        defaultMessage: [
          {
            type: 0,
            value: 'Interfering Links'
          }
        ]
      },
      value: '0',
      delta: {
        trend: TrendTypeEnum.Positive,
        value: '-100%'
      },
      footer: ''
    }
    render(<KPICard kpi={mockedKPI} />)

    expect(screen.getByText('Interfering Links')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('-100%')).toBeInTheDocument()
  })
})

describe('KPIGrid', () => {
  it('should render with loader and card', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentKPIs', { data: { intent: mockedIntentCRRMKPIs } })

    const intent = mockedIntentCRRM
    const params = { root: intent.root, sliceId: intent.sliceId, code: intent.code }
    mockIntentContext({ intent, kpis })
    render(<KPIGrid />, { wrapper, route: { params } })

    const loader = screen.getByRole('img', { name: 'loader' })
    expect(loader).toBeVisible()

    const kpiCard = await screen.findByTestId('KPI')
    expect(kpiCard).toBeInTheDocument()

  })
})

describe('KPIFields', () => {
  it('should render with loader and field', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentKPIs', { data: { intent: mockedIntentCRRMKPIs } })

    const intent = mockedIntentCRRM
    const params = { root: intent.root, sliceId: intent.sliceId, code: intent.code }
    mockIntentContext({ intent, kpis })
    render(<KPIFields />, { wrapper, route: { params } })

    const loader = screen.getByRole('img', { name: 'loader' })
    expect(loader).toBeVisible()

    const kpiField = await screen.findByText('Interfering Links')
    expect(kpiField).toBeInTheDocument()
  })
})
