import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import * as CommonComponent from '@acx-ui/components'
import { Provider }         from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import Canvas          from './Canvas'
import { LayoutProps } from './components/Layout'

const mockedShowActionModal = jest.fn().mockImplementation((props) => props.onOk && props.onOk())
jest.spyOn(CommonComponent, 'showActionModal').mockImplementation(
  mockedShowActionModal
)

const mockedUpdate = jest.fn()
jest.mock('@acx-ui/rc/services', () => ({
  useUpdateCanvasMutation: () => ([ mockedUpdate ]),
  useLazyGetCanvasQuery: () => [
    jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue([
        {
          id: '65bcb4d334ec4a47b21ae5e062de279f',
          name: 'Canvas',
          // eslint-disable-next-line max-len
          content: '[{"id":"default_section","type":"section","hasTab":false,"groups":[{"id":"default_group","sectionId":"default_section","type":"group","cards":[{"axisType":"category","multiSeries":false,"chartType":"bar","chartOption":{"dimensions":["Current Connection Status","AP Count"],"source":[["Offline",3],["Online",1]],"seriesEncode":[{"x":"AP Count","y":"Current Connection Status","seriesName":null}],"multiSeries":false},"sessionId":"989a8e31-f282-497e-be3b-14478f5c1cf9","id":"685e5931349d4f86867419a67dc93ec92d8900ce-29d3-4677-9ddc-0c5aae9ade15","chatId":"685e5931349d4f86867419a67dc93ec9","type":"card","isShadow":false,"width":2,"height":6,"currentSizeIndex":0,"sizes":[{"width":2,"height":6},{"width":3,"height":10},{"width":4,"height":12}],"gridx":0,"gridy":0}]}]}]'
        }
      ])
    }))
  ]
}))

jest.mock('./components/Layout', () => (props: LayoutProps) =>
  <div>Layout {props.groups && 'work!'}</div>
)

describe('Canvas', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <Canvas/>
      </Provider>
    )
    expect(await screen.findByText('Dashboard Canvas')).toBeVisible()
    expect(await screen.findByText('Layout work!')).toBeVisible()
    const saveButton = await screen.findByText('Save')
    await userEvent.click(saveButton)
    expect(mockedUpdate).toBeCalledTimes(1)
  })
})