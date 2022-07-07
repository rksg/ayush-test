import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Subtitle } from '.'

describe('Subtitle', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <>
        <Subtitle level={1}>Subtitle 1</Subtitle>
        <Subtitle level={2}>Subtitle 2</Subtitle>
        <Subtitle level={3}>Subtitle 3</Subtitle>
        <Subtitle level={4}>Subtitle 4</Subtitle>
        <Subtitle level={5}>Subtitle 5</Subtitle>
      </>)
    expect(asFragment()).toMatchSnapshot()
  })
})
