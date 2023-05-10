import { render } from '@testing-library/react'

import { PreferredLanguageFormItem } from './'

describe('PreferredLanguageFormItem', () => {
  it.skip('should render successfully', () => {
    const { baseElement } = render(<PreferredLanguageFormItem />)
    expect(baseElement).toBeTruthy()
  })
})
