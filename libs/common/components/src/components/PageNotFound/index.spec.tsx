import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { PageNotFound } from './index'

describe('PageNotFound', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <PageNotFound />
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
