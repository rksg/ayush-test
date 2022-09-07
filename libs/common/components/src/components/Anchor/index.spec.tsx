import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { AnchorLayout } from './index'

const items = [{
  title: 'Anchor 1',
  content: 'Content 1'
}, {
  title: 'Anchor 2',
  content: 'Content 2'
}, {
  title: 'Anchor 3',
  content: 'Content 3'
}]

describe('Anchor', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <AnchorLayout items={items} />
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
