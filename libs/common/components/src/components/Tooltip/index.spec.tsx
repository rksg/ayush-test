import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Tooltip } from '.'

describe('Subtitle', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <Tooltip title={'This is a tooltip'}>
          Some text
      </Tooltip>)
    expect(asFragment()).toMatchSnapshot()
  })
})
