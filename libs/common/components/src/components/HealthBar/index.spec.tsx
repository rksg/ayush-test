import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { HealthBar } from '.'

describe('Grid', () => {
  it('should render grid row', () => {
    const { asFragment } = render(<HealthBar value={0.8}/>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render grid col', () => {
    const { asFragment } = render(<HealthBar value={0.0}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
