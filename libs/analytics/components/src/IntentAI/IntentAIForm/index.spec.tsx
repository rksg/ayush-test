import { AIDrivenRRM } from './AIDrivenRRM'

import { IntentAIForm } from '.'

const mockParams = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useParams: () => mockParams()
}))

describe('IntentAIForm', () => {
  beforeEach(() => {
    mockParams.mockClear()
  })
  it('should render AIDrivenRRM for c-crrm-channel24g-auto', () => {
    mockParams.mockReturnValue({ code: 'c-crrm-channel24g-auto' })

    expect(IntentAIForm()).toEqual(<AIDrivenRRM />)
  })

  it('should render AIDrivenRRM for c-crrm-channel5g-auto', () => {
    mockParams.mockReturnValue({ code: 'c-crrm-channel5g-auto' })

    expect(IntentAIForm()).toEqual(<AIDrivenRRM />)
  })

  it('should render AIDrivenRRM for c-crrm-channel6g-auto', () => {
    mockParams.mockReturnValue({ code: 'c-crrm-channel6g-auto' })

    expect(IntentAIForm()).toEqual(<AIDrivenRRM />)
  })
})
