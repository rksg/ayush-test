import { Form } from 'antd'

import { render } from '@acx-ui/test-utils'

import DPSKSettingsForm from './DPSKSettingsForm'

describe('DPSKSettingsForm', () => {
  it('should render the form', async ()=> {
    const { asFragment } = render(<Form><DPSKSettingsForm /></Form>)

    expect(asFragment()).toMatchSnapshot()
  })
})
