import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import ManageCanvasDrawer,{ DrawerProps } from './ManageCanvasDrawer'

const canvasList = [{
  id: '65bcb4d334ec4a47b21ae5e062de279f',
  name: 'Dashboard Canvas',
  visible: true,
  dashboardIds: ['123'],
  content: `[{
    "id":"default_section",
    "type":"section",
    "hasTab":false,
    "groups":[
      {
        "id":"default_group",
        "sectionId":"default_section",
        "type":"group",
        "cards":[
          {
            "axisType":"category","multiSeries":false,"chartType":"bar","chartOption":{
            "dimensions":["Current Connection Status","AP Count"],
            "source":[["Offline",3],["Online",1]],
            "seriesEncode":[{"x":"AP Count","y":"Current Connection Status","seriesName":null}],
            "multiSeries":false},"sessionId":"989a8e31-f282-497e-be3b-14478f5c1cf9",
            "id":"685e5931349d4f86867419a67dc93ec92d8900ce-29d3-4677-9ddc-0c5aae9ade15",
            "chatId":"685e5931349d4f86867419a67dc93ec9","type":"card","isShadow":false,
            "width":2,"height":6,"currentSizeIndex":0,
            "sizes":[{"width":2,"height":6},{"width":3,"height":10},{"width":4,"height":12}],
            "gridx":0,"gridy":0}]
          }
        ]
      }
    ]`
}]

const mockProps = {
  visible: true,
  onClose: jest.fn(),
  canvasList
} as unknown as DrawerProps

const mockedDelete = jest.fn()
const mockedUpdate = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  useDeleteCanvasMutation: () => [mockedDelete],
  usePatchCanvasMutation: () => [mockedUpdate]
}))

describe('ManageCanvasDrawer', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders with default props', async () => {
    render(
      <Provider>
        <ManageCanvasDrawer {...mockProps} />
      </Provider>
    )
    expect(screen.getByText('Manage My Canvases')).toBeVisible()
    expect(screen.getByText('Dashboard Canvas')).toBeVisible()
  })

  it('closes drawer when cancel button is clicked', async () => {
    render(
      <Provider>
        <ManageCanvasDrawer {...mockProps} />
      </Provider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should delete a canvas correctly', async () => {
    const props = {
      visible: true,
      onClose: jest.fn(),
      canvasList: [
        ...canvasList,
        {
          id: '002',
          name: 'Canvas 2',
          visible: true,
          content: ''
        }
      ]
    }
    render(
      <Provider>
        <ManageCanvasDrawer {...props} />
      </Provider>
    )
    expect(screen.getByText('Dashboard Canvas')).toBeVisible()
    fireEvent.click(screen.getAllByTestId('delete')[0])
    const deleteBtn = await screen.findByText('Delete Canvas')
    expect(deleteBtn).toBeVisible()
    fireEvent.click(deleteBtn)
    expect(mockedDelete).toHaveBeenCalledTimes(1)
  })

  it('should not delete the last one canvas', async () => {
    render(
      <Provider>
        <ManageCanvasDrawer {...mockProps} />
      </Provider>
    )
    expect(screen.getByText('Dashboard Canvas')).toBeVisible()
    const deleteIcon = screen.getByTestId('delete')
    expect(deleteIcon).toHaveClass('disabled')
  })

  it('should edit a canvas correctly', async () => {
    render(
      <Provider>
        <ManageCanvasDrawer {...mockProps} />
      </Provider>
    )
    expect(screen.getByText('Dashboard Canvas')).toBeVisible()
    await userEvent.click(screen.getByTestId('edit'))
    expect(await screen.findByText('Edit Canvas')).toBeVisible()
    expect(await screen.findByText('Canvas Name')).toBeVisible()
    expect(await screen.findByText('Visibility Type')).toBeVisible()
    const nameInput = await screen.findByTestId('canvas-name')
    await userEvent.type(nameInput, 'My Canvas')
    await userEvent.click(await screen.findByText('Make Private'))
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    expect(mockedUpdate).toHaveBeenCalledTimes(1)
  })

})
