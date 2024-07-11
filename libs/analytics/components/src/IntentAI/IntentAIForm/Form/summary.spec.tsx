import { render, screen } from '@acx-ui/test-utils'

import { Summary } from './summary'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => {
    return {
      form: {
        getFieldValue: () => 'full'
      }
    }
  }
}))

describe('summary', () => {
  it('should match snapshot', async () => {
    const { asFragment } = render(<Summary />)
    expect(await screen.findByText('High number of clients in a dense network')).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })
})
