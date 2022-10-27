import '@testing-library/jest-dom'

import { RougeAPDetectionContextType } from '@acx-ui/rc/utils'
import { Provider }                    from '@acx-ui/store'
import { render, screen }              from '@acx-ui/test-utils'

import RougeAPDetectionContext from '../RougeAPDetectionContext'

import RougeAPDetectionSummaryForm from './RougeAPDetectionSummaryForm'


const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}
const setRougeAPDetectionSummary = jest.fn()

const initState = {
  venues: [{
    id: 'venueId1',
    name: 'venueName1'
  }],
  policyName: 'policyName1',
  rules: [{
    name: 'rule1',
    type: 'AdhocRule',
    classification: 'Malicious',
    priority: 1
  }],
  tags: ['tag1', 'tag2', 'tag3'],
  description: ''
} as RougeAPDetectionContextType

describe('RougeAPDetectionSummaryForm', () => {
  it('should render form successfully', async () => {
    const { asFragment } = render(
      <RougeAPDetectionContext.Provider value={{
        state: initState,
        dispatch: setRougeAPDetectionSummary
      }}>
        <RougeAPDetectionSummaryForm />
      </RougeAPDetectionContext.Provider>,
      { wrapper }
    )
    expect(screen.getByText('policyName1')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('tag1, tag2, tag3')).toBeInTheDocument()
    expect(screen.getByText('venueName1')).toBeInTheDocument()

    expect(asFragment()).toMatchSnapshot()
  })
})
