import { FormattedMessage } from 'react-intl'

import { render } from '@acx-ui/test-utils'

import { formatValues } from './contents'

describe('formatValues', () => {
  it('renders elements', () => {
    const { asFragment } = render(<FormattedMessage
      defaultMessage={`
        <p>paragraph</p>
        <ul>
          <li>item 1</li>
          <li>item 2</li>
        </ul>
      `}
      values={formatValues}
    />)

    expect(asFragment()).toMatchSnapshot()
  })
})
