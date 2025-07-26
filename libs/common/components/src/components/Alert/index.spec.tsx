import '@testing-library/jest-dom'
import { render, screen } from '@acx-ui/test-utils'

import { Alert } from './index'

describe('Alert', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <>
        <Alert message='Informational Notes' type='info' showIcon closable />
        <p />
        <Alert message='Primary/Blue Information' type='primary' showIcon closable />
        <p />
        <Alert message='Error' type='error' showIcon closable />
      </>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render primary type with correct class', () => {
    render(
      <Alert message='Primary Alert' type='primary' showIcon />
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveClass('ant-alert-primary')
    expect(alert).toHaveClass('ant-alert-info') // Should map to info type for Antd
  })
})
