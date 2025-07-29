import '@testing-library/jest-dom'
import { render } from '@acx-ui/test-utils'

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
