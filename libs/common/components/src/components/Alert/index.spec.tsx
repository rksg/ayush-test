import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Alert } from './index'

describe('Alert', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <>
        <Alert message='Informational Notes' type='info' showIcon closable />
        <p />
        <Alert message='Error' type='error' showIcon closable />
      </>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
