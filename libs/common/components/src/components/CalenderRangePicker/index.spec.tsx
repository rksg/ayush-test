import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { CalenderRangePicker } from '.'

describe('CalenderRangePicker', () => {
  it('should render default CalenderRangePicker', () => {
    const { asFragment } = render(<CalenderRangePicker showRanges/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
