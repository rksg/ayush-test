import { get }            from '@acx-ui/config'
import { screen, render } from '@acx-ui/test-utils'

import { Introduction } from './introduction'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => {
    return {
      initialValues: {
        status: 'applied',
        sliceValue: 'NewZone',
        updatedAt: '2023-06-26T00:00:25.772Z'
      }
    }
  }
}))

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('introduction test', () => {
  it('should match snapshot', async () => {
    const { asFragment } = render(<Introduction />)
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByText('Applied')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly when IS_MLISA_SA is true', async () => {
    mockGet.mockReturnValue('true')
    const { asFragment } = render(<Introduction />)
    expect(await screen.findByText('Zone')).toBeVisible()
    expect(await screen.findByText('Applied')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})
