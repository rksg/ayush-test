import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { SwitchCliSession } from './index'

describe('SwitchCliSession', () => {
  it('render switchCliSession - hidden', async () => {
    render(
      <Provider>
        <SwitchCliSession
          modalState={false}
          setIsModalOpen={jest.fn()}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          switchName={'switchName'}
        />
      </Provider>)

    expect(screen.queryByText(/cli session \- switchname/i)).not.toBeInTheDocument()
  })

  it('render switchCliSession - show', async () => {
    render(
      <Provider>
        <SwitchCliSession
          modalState={true}
          setIsModalOpen={()=>true}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          switchName={'switchName'}
        />
      </Provider>)

    expect(await screen.findByText(/cli session \- switchname/i)).toBeInTheDocument()
  })

  it('render switchCliSession with modal', async () => {
    render(
      <Provider>
        <SwitchCliSession
          modalState={true}
          setIsModalOpen={jest.fn()}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          switchName={'switchName'}
        />
      </Provider>)

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

  it('renders SwitchCliSession with modal interactions', async () => {
    const setIsModalOpenMock = jest.fn()
    render(
      <Provider>
        <SwitchCliSession
          modalState={true}
          setIsModalOpen={setIsModalOpenMock}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          switchName={'switchName'}
        />
      </Provider>
    )

    // Checking modal title
    expect(await screen.findByText(/cli session \- switchname/i)).toBeInTheDocument()

    // Draggable interactions
    const dragRef = await screen.findByTestId('switchCliSessionDraggableRef')
    const wrapper = await screen.findByTestId('switchCliSessionDialogWrapper')
    const div = await screen.findByTestId('switchCliSessionModalDiv')

    fireEvent.mouseOver(div)
    fireEvent.mouseOut(div)
    fireEvent.dragStart(dragRef)
    fireEvent.dragOver(wrapper)
    fireEvent.dragEnd(wrapper)

    // Resizing interactions
    fireEvent.mouseOver(wrapper)
    fireEvent.mouseOut(wrapper)
    window.innerWidth = 1000
    window.innerHeight = 500
    window.dispatchEvent(new Event('resize'))

    // Close button interaction
    fireEvent.click(await screen.findByRole('button', { name: /close/i }))
    expect(setIsModalOpenMock).toHaveBeenCalledWith(false)
  })

  it('calls onResize', async () => {
    render(
      <Provider>
        <SwitchCliSession
          modalState={true}
          setIsModalOpen={jest.fn()}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          switchName={'switchName'}
        />
      </Provider>
    )

    // Simulate resize event
    const resizableBox = await screen.findByTestId('switchCliSessionDialogWrapper')
    fireEvent.mouseOver(resizableBox)
    fireEvent.mouseOut(resizableBox)

    // Additional assertions can be added to check the height and width state changes
  })
})
