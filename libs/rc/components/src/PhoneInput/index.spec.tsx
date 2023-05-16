import { render } from '@acx-ui/test-utils'

import { PhoneInput } from '.'
describe('PhoneInput', () => {
  it('should render correctly', async () => {
    render(<PhoneInput callback={jest.fn()} />)
  })
})