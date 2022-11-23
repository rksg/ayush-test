import { Form } from 'antd'

import { render } from '@acx-ui/test-utils'

import { ExpirationDateSelector } from '.'

describe('ExpirationDateSelector', () => {
  const mockedLabel = 'Expiration'
  it('should render the selector', async () => {
    const { asFragment } = render(
      <Form>
        <ExpirationDateSelector label={mockedLabel} />
      </Form>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
