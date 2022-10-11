import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { HealthBar } from '.'

describe('HealthBar', () => {
  it('should render HealthBar', () => {
    const { asFragment } = render(<HealthBar value={0.8}/>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render HealthBar with blockNumber', () => {
    const { asFragment } = render(<HealthBar value={0.0} blockNumber={3}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
