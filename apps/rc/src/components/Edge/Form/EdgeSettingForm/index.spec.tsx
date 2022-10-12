import {
  render
} from '@acx-ui/test-utils'

import EdgeSettingForm from './index'

describe('EdgeSettingForm', () => {
  it('should create EdgeSettingForm successfully', async () => {
    const { asFragment } = render(<EdgeSettingForm />)
    expect(asFragment()).toMatchSnapshot()
  })
})