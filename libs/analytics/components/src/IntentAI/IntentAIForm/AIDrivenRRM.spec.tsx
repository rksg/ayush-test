import userEvent from '@testing-library/user-event'
import { pick }  from 'lodash'

import { recommendationUrl, Provider }                                         from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockedRecommendationCRRM } from './__tests__/fixtures'
import { AIDrivenRRM }              from './AIDrivenRRM'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'), // use actual for all non-hook parts
  useParams: () => ({
    id: 'b17acc0d-7c49-4989-adad-054c7f1fc5b6'
  })
}))

describe('AIDrivenRRM', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationCode', {
      data: { recommendation: pick(mockedRecommendationCRRM, ['id', 'code']) }
    })
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationCRRM }
    })
    jest.spyOn(require('../Recommendations/utils'), 'isDataRetained')
      .mockImplementation(() => true)
  })
  it('should match snapshot', async () => {
    const { asFragment } = render(<AIDrivenRRM />, {
      route: { path: '/ai/recommendations/crrm/b17acc0d-7c49-4989-adad-054c7f1fc5b6' },
      wrapper: Provider
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render correctly', async () => {
    render(<AIDrivenRRM />, {
      route: { path: '/ai/recommendations/crrm/b17acc0d-7c49-4989-adad-054c7f1fc5b6' },
      wrapper: Provider
    })

    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByText('Benefits')).toBeVisible()
    await userEvent.click(actions.getByRole('button', { name: 'Next' }))
    await screen.findAllByRole('heading', { name: 'Intent Priority' })

    expect(await screen.findByText('Potential trade-off')).toBeVisible()
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
