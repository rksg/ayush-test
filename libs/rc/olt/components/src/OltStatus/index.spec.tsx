import { OltStatusEnum }  from '@acx-ui/olt/utils'
import { screen, render } from '@acx-ui/test-utils'
import '@testing-library/jest-dom'

import { OltStatus } from './'

describe('OltStatus', () => {
  const validProps = {
    status: OltStatusEnum.ONLINE,
    showText: true
  }

  it('renders with online status and showText true', () => {
    render(<OltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders with showText true and false', () => {
    const { rerender } = render(<OltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()

    rerender(<OltStatus {...validProps} showText={false} />)
    expect(screen.queryByText('Online')).toBeNull()
  })

  it('renders with undefined status', () => {
    render(<OltStatus
      {...validProps}
      status={OltStatusEnum.UNKNOWN}
      showText
    />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

})