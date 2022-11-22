import { Form } from 'antd'

import { render } from '@acx-ui/test-utils'

import DpskSettingsForm from './DpskSettingsForm'

describe('DpskSettingsForm', () => {
  it('should render the form', async ()=> {
    const { asFragment } = render(<Form><DpskSettingsForm /></Form>)

    expect(asFragment()).toMatchSnapshot()
  })
})
