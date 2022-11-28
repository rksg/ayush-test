import { render } from '@acx-ui/test-utils'

import { HistoricalCard } from '.'

describe('HistoricalCard', () => {
  it('should render HistoricalCard', () => {
    const { asFragment } = render(<HistoricalCard title='title' subTitle='sub title' />)
    expect(asFragment()).toMatchSnapshot()
  })
})
