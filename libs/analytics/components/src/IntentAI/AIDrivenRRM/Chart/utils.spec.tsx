import { createIntl, createIntlCache } from 'react-intl'

import { render } from '@acx-ui/test-utils'

import { customTooltipText } from './utils'

const cache = createIntlCache()
const intl = createIntl(
  {
    locale: 'en',
    messages: {}
  },
  cache
)

describe('customTooltipText', () => {
  it('renders correctly', async () => {
    const values = {
      xValue: '6',
      yValue: 3,
      xName: 'Channel',
      intl
    }

    const { asFragment } =render(<>{customTooltipText(values)}</>)

    expect(asFragment()).toMatchSnapshot()
  })
})
