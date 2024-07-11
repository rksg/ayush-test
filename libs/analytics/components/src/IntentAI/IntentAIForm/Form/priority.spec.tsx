/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'

import { get }            from '@acx-ui/config'
import { render, screen } from '@acx-ui/test-utils'

import { Priority } from './priority'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => {
    return {
      initialValues: {
        sliceValue: 'NewZone',
        preferences: 'partial'
      }
    }
  }
}))

const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

describe('priority', () => {
  it('should match snapshot', async () => {
    const { asFragment } = render(<Priority />)
    expect(await screen.findByText('What is your primary network intent for Venue: NewZone')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly when IS_MLISA_SA is true', async () => {
    mockGet.mockReturnValue('true')
    const { asFragment } = render(<Priority />)
    const fullOptimizeRadio = screen.getByRole('radio', {
      name: 'High number of clients in a dense network (Default)'
    })
    await userEvent.click(fullOptimizeRadio)
    expect(await screen.findByText('What is your primary network intent for Zone: NewZone')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})
