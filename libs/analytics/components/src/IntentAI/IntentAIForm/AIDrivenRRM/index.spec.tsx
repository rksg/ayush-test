/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { pick }  from 'lodash'

import { get }                                      from '@acx-ui/config'
import { recommendationUrl, Provider }              from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, within } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedRecommendationCRRM } from '../../IntentAIDetails/__tests__/fixtures'

import { AIDrivenRRM, isOptimized } from '.'

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    recommendationId: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
  })
}))

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => {
    return {
      initialValues: {
        status: 'applyscheduled',
        sliceValue: '21_US_Beta_Samsung',
        updatedAt: '2023-06-26T00:00:25.772Z',
        crrmInterferingLinks: {
          before: 1,
          after: 0
        }
      },
      form: {
        getFieldValue: () => 'partial'
      }
    }
  }
}))

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('AIDrivenRRM', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationCode', {
      data: { recommendation: pick(mockedRecommendationCRRM, ['id', 'code']) }
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationCRRM }
    })
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
    jest.spyOn(require('../../utils'), 'isDataRetained')
      .mockImplementation(() => true)
  })
  window.ResizeObserver = ResizeObserver

  it('should render correctly', async () => {
    render(<AIDrivenRRM />, {
      route: {
        path: '/ai/intentAi/b17acc0d-7c49-4989-adad-054c7f1fc5b6/c-crrm-channel24g-auto/edit'
      },
      wrapper: Provider
    })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    const hiddenGraph = await screen.findByTestId('hidden-graph')
    expect(hiddenGraph).toBeInTheDocument()
    expect(await screen.findByText('Benefits')).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Intent Priority' })
    expect(await screen.findByText('Potential trade-off?')).toBeVisible()
    const throughputRadio = screen.getByRole('radio', {
      name: 'High client throughput in sparse network'
    })
    await userEvent.click(throughputRadio)
    expect(throughputRadio).toBeChecked()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Settings' })
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Summary' })
    expect(screen.getByRole('button', {
      name: 'Apply'
    })).toBeVisible()
  })

  it('should render correctly when IS_MLISA_SA is true', async () => {
    mockGet.mockReturnValue('true')
    render(<AIDrivenRRM />, {
      route: { path: '/ai/intentAi/b17acc0d-7c49-4989-adad-054c7f1fc5b6/c-crrm-channel24g-auto/edit' },
      wrapper: Provider
    })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByText('Benefits')).toBeVisible()
    expect(await screen.findByText('Zone')).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Intent Priority' })
    expect(await screen.findByText('Potential trade-off?')).toBeVisible()
    const throughputRadio = screen.getByRole('radio', {
      name: 'High client throughput in sparse network'
    })
    await userEvent.click(throughputRadio)
    expect(throughputRadio).toBeChecked()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Settings' })
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))

    await screen.findAllByRole('heading', { name: 'Summary' })
    expect(screen.getByRole('button', {
      name: 'Apply'
    })).toBeVisible()
  })
})

describe('isOptimized', () => {
  it('should return full when value is true', () => {
    expect(isOptimized(true)).toBe('full')
  })

  it('should return partial when value is false', () => {
    expect(isOptimized(false)).toBe('partial')
  })
})
