import { render, screen } from '@acx-ui/test-utils'

import { SwitchCliSession } from './index'

describe('SwitchCliSession', () => {
  it('render switchCliSession', async () => {
    render(<SwitchCliSession
      modalState={false}
      setIsModalOpen={jest.fn()}
      jwtToken={'jwtToken'}
      serialNumber={'serialNumber'}
      switchName={'switchName'}
    />)

    expect(screen.queryByText(/cli session \- switchname/i)).not.toBeInTheDocument()
  })

  it('render switchCliSession with modal', async () => {
    render(<SwitchCliSession
      modalState={true}
      setIsModalOpen={jest.fn()}
      jwtToken={'jwtToken'}
      serialNumber={'serialNumber'}
      switchName={'switchName'}
    />)

    expect(await screen.findByText(/cli session \- switchname/i)).toBeInTheDocument()
  })
})
