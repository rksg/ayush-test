import { render } from '@acx-ui/test-utils'

import { HistoricalCard } from '.'

jest.mock('@acx-ui/icons', ()=> {
  const icons = jest.requireActual('@acx-ui/icons')
  const keys = Object.keys(icons).map(key => [key, () => <div data-testid={key} />])
  return Object.fromEntries(keys)
})

describe('HistoricalCard', () => {
  it('should render HistoricalCard', () => {
    const { asFragment } = render(<HistoricalCard title='title' subTitle='sub title' />)
    expect(asFragment()).toMatchSnapshot()
  })
})
