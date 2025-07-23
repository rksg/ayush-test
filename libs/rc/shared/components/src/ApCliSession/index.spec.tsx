import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { ApCliSession } from './index'

describe('ApCliSession', () => {
  it('render ApCliSession - hidden', async () => {
    render(
      <Provider>
        <ApCliSession
          modalState={false}
          setIsModalOpen={jest.fn()}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          apName={'apName'}
        />
      </Provider>)

    expect(screen.queryByText(/cli session \- apName/i)).not.toBeInTheDocument()
  })

  it('render ApCliSession - show', async () => {
    render(
      <Provider>
        <ApCliSession
          modalState={true}
          setIsModalOpen={()=>true}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          apName={'apName'}
        />
      </Provider>)

    expect(await screen.findByText(/CLI Session\: apName/)).toBeInTheDocument()
  })

  it('render ApCliSession with modal', async () => {
    render(
      <Provider>
        <ApCliSession
          modalState={true}
          setIsModalOpen={jest.fn()}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          apName={'apName'}
        />
      </Provider>)

    expect(await screen.findByText(/CLI Session\: apName/i)).toBeInTheDocument()

    const dragRef = await screen.findByTestId('apCliSessionDraggableRef')
    const wrapper = await screen.findByTestId('apCliSessionDialogWrapper')
    const div = await screen.findByTestId('apCliSessionModalDiv')

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

  it('render ApCliSession with modal interactions', async () => {
    const setIsModalOpenMock = jest.fn()
    render(
      <Provider>
        <ApCliSession
          modalState={true}
          setIsModalOpen={setIsModalOpenMock}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          apName={'apName'}
        />
      </Provider>
    )

    // Checking modal title
    expect(await screen.findByText(/cli session\: apName/i)).toBeInTheDocument()

    // Draggable interactions
    const dragRef = await screen.findByTestId('apCliSessionDraggableRef')
    const wrapper = await screen.findByTestId('apCliSessionDialogWrapper')
    const div = await screen.findByTestId('apCliSessionModalDiv')

    fireEvent.mouseOver(div)
    fireEvent.mouseOut(div)
    fireEvent.dragStart(dragRef)
    fireEvent.dragOver(wrapper)
    fireEvent.dragEnd(wrapper)

    // Resizing interactions
    fireEvent.mouseOver(wrapper)
    fireEvent.mouseOut(wrapper)
    window.innerWidth = 800
    window.innerHeight = 600
    window.dispatchEvent(new Event('resize'))

    // Close button interaction
    fireEvent.click(await screen.findByRole('button', { name: /close/i }))
    expect(setIsModalOpenMock).toHaveBeenCalledWith(false)
  })

  it('call onResize', async () => {
    render(
      <Provider>
        <ApCliSession
          modalState={true}
          setIsModalOpen={jest.fn()}
          jwtToken={'jwtToken'}
          serialNumber={'serialNumber'}
          apName={'apName'}
        />
      </Provider>
    )

    // Simulate resize event
    const resizableBox = await screen.findByTestId('apCliSessionDialogWrapper')
    fireEvent.mouseOver(resizableBox)
    fireEvent.mouseOut(resizableBox)
  })
})
