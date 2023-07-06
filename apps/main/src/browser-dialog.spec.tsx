import { render } from '@testing-library/react'

import BrowserDialog from './browser-dialog'

describe('BrowserDialog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BrowserDialog />)
    expect(baseElement).toBeTruthy()
  })
})
