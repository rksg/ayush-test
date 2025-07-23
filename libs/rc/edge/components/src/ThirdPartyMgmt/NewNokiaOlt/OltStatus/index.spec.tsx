import { EdgeNokiaOltStatusEnum } from '@acx-ui/rc/utils'
import { screen, render }         from '@acx-ui/test-utils'

import { EdgeNewNokiaOltStatus } from './'

describe('EdgeNokiaOltStatus', () => {
  const validProps = {
    status: EdgeNokiaOltStatusEnum.ONLINE,
    showText: true
  }

  it('renders with online status and showText true', () => {
    render(<EdgeNewNokiaOltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders with showText true and false', () => {
    const { rerender } = render(<EdgeNewNokiaOltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()

    rerender(<EdgeNewNokiaOltStatus {...validProps} showText={false} />)
    expect(screen.queryByText('Online')).toBeNull()
  })

  it('renders with undefined status', () => {
    render(<EdgeNewNokiaOltStatus
      {...validProps}
      status={EdgeNokiaOltStatusEnum.UNKNOWN}
      showText
    />)
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

})