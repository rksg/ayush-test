import { render } from '@testing-library/react'

import EnableR1Beta from './'

describe('EnableR1Beta', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<EnableR1Beta />)
    expect(baseElement).toBeTruthy()
  })
})
