import { EdgeNokiaCageStateEnum, EdgeNokiaOltStatusEnum } from '@acx-ui/rc/utils'
import { screen, render }                                 from '@acx-ui/test-utils'

import { EdgeNokiaOltStatus } from './'

describe('EdgeNokiaOltStatus', () => {
  const config = {
    online: { color: 'green', text: 'Online' },
    offline: { color: 'red', text: 'Offline' }
  }

  const validProps = {
    config,
    status: EdgeNokiaOltStatusEnum.ONLINE,
    showText: true
  }

  it('renders with valid config and status', () => {
    render(<EdgeNokiaOltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders with showText true and false', () => {
    const { rerender } = render(<EdgeNokiaOltStatus {...validProps} />)
    expect(screen.getByText('Online')).toBeInTheDocument()

    rerender(<EdgeNokiaOltStatus {...validProps} showText={false} />)
    expect(screen.queryByText('Online')).toBeNull()
  })

  it('renders nothing when the mapping is not found', async () => {
    const invalidConfig = {
      test: { color: 'yellow', text: 'Online' }
    }
    render(<EdgeNokiaOltStatus
      config={invalidConfig}
      status={EdgeNokiaCageStateEnum.UP}
      showText
    />)
    expect(screen.queryByText('up')).toBeNull()
  })

  it('renders props.status as default text', async () => {
    const mockConfig = {
      up: { color: 'yellow' }
    }
    render(<EdgeNokiaOltStatus config={mockConfig} status={EdgeNokiaCageStateEnum.UP} showText />)
    expect(await screen.findByText('up')).toBeVisible()
  })
})