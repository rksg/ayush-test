import { OltStatusEnum, OltCageStateEnum, OltPortStatusEnum } from '@acx-ui/olt/utils'
import { screen, render }                                     from '@acx-ui/test-utils'
import '@testing-library/jest-dom'

import { OltStatus } from './'

describe('OltStatus', () => {
  const validProps = {
    status: OltStatusEnum.ONLINE,
    showText: true
  }

  it('should render online status with text correctly', () => {
    render(<OltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('should render cage up status with text correctly', () => {
    render(<OltStatus type='cage' status={OltCageStateEnum.UP} showText />)
    expect(screen.getByText('Up')).toBeInTheDocument()
  })

  it('should render port up status with text correctly', () => {
    render(<OltStatus type='port' status={OltPortStatusEnum.UP} showText />)
    expect(screen.getByText('Up')).toBeInTheDocument()
  })

  it('should render online status without text correctly', () => {
    const { rerender } = render(<OltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()

    rerender(<OltStatus {...validProps} showText={false} />)
    expect(screen.queryByText('Online')).toBeNull()
  })

  it('should render unknown status correctly', () => {
    render(<OltStatus
      {...validProps}
      status={undefined}
      showText
    />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

})