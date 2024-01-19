import { fireEvent, render, screen } from '@acx-ui/test-utils'

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

    const dragRef = await screen.findByTestId('switchCliSessionDraggableRef')
    const wrapper = await screen.findByTestId('switchCliSessionDialogWrapper')
    const div = await screen.findByTestId('switchCliSessionModalDiv')

    fireEvent.dragStart(dragRef)
    fireEvent.dragOver(wrapper)
    fireEvent.dragEnd(wrapper)

    fireEvent.mouseOver(wrapper)
    fireEvent.mouseOut(wrapper)

    fireEvent.mouseOver(div)
    fireEvent.mouseOut(div)

    window.innerWidth = 1000
    window.innerHeight = 500
    window.dispatchEvent(new Event('resize'))

    fireEvent.click(await screen.findByRole('button', { name: /close/i }))
  })
})
