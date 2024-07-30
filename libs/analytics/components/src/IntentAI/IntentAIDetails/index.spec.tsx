import { CrrmDetails } from './AIDrivenRRM/CrrmDetails'

import { IntentAIDetails } from './index'

const mockParams = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: () => mockParams()
}))

describe('IntentAIDetails', () => {
  beforeEach(() => {
    mockParams.mockClear()
  })

  it('should render a CrrmDetails when code is crrm 2.4g', () => {
    mockParams.mockReturnValue({
      code: 'c-crrm-channel24g-auto'
    })

    expect(IntentAIDetails()).toEqual(<CrrmDetails/>)
  })

  it('should render a CrrmDetails when code is crrm 5g', () => {
    mockParams.mockReturnValue({
      code: 'c-crrm-channel5g-auto'
    })

    expect(IntentAIDetails()).toEqual(<CrrmDetails/>)
  })

  it('should render a CrrmDetails when code is crrm 6g', () => {
    mockParams.mockReturnValue({
      code: 'c-crrm-channel6g-auto'
    })

    expect(IntentAIDetails()).toEqual(<CrrmDetails/>)
  })
})
