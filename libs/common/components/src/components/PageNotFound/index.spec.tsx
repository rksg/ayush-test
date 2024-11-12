import '@testing-library/jest-dom'
import { render } from '@acx-ui/test-utils'

import { PageNotFound } from './index'

describe('PageNotFound', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <PageNotFound />
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
