import { render } from '@testing-library/react'

import CommonRbac from './common-rbac'

describe('CommonRbac', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CommonRbac />)
    expect(baseElement).toBeTruthy()
  })
})
