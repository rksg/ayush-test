import '@testing-library/jest-dom'
import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import * as CommonComponent from '@acx-ui/components'
import { Provider }         from '@acx-ui/store'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import Canvas          from './Canvas'
import { LayoutProps } from './components/Layout'

const mockedShowActionModal = jest.fn().mockImplementation((props) => props.onOk && props.onOk())
jest.spyOn(CommonComponent, 'showActionModal').mockImplementation(
  mockedShowActionModal
)

const mockedUpdate = jest.fn()
const mockedGetCanvas = jest.fn(() => ({
  unwrap: jest.fn().mockResolvedValue([
    {
      id: '65bcb4d334ec4a47b21ae5e062de279f',
      name: 'Canvas',
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
    }
  ])
}))

jest.mock('@acx-ui/rc/services', () => ({
  useUpdateCanvasMutation: () => ([ mockedUpdate ]),
  useLazyGetCanvasQuery: () => ([ mockedGetCanvas ])
}))

jest.mock('./components/Layout', () => (props: LayoutProps) =>
  <div>Layout {props.groups[0]?.cards.length && 'cards'}</div>
)

const groupsData = [
  {
    id: 'default_group',
    sectionId: 'default_section',
    type: 'group',
    cards: [
      {
        unit: {
          'Traffic (Total)': 'BYTES'
        },
        axisType: 'time',
        multiSeries: false,
        chartType: 'line',
        chartOption: [
        ],
        sessionId: 'c8643f44-87a0-4c3c-a969-a81a6a0ee041',
        id: '9d7505c502db463883fa11870bc25d7c9430086a-e19c-4d4a-8d41-6918c667a696',
        chatId: '9d7505c502db463883fa11870bc25d7c',
        type: 'card',
        isShadow: false,
        width: 2,
        height: 6,
        currentSizeIndex: 0,
        sizes: [
          {
            width: 2,
            height: 6
          },
          {
            width: 4,
            height: 8
          }
        ],
        gridx: 0,
        gridy: 0,
        widgetId: 'a15d9b80ff07470e8d7c51c03b22d078',
        canvasId: 'c75cb313973047e6895e0f79f6c58c43'
      }
    ]
  }
]

describe('Canvas', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render layout correctly', async () => {
    const { result } = renderHook(() => {
      const [groups, setGroups] = useState(groupsData)
      return { groups, setGroups }
    })
    render(
      <Provider>
        <Canvas
          groups={result.current.groups}
          setGroups={result.current.setGroups}
        />
      </Provider>
    )
    expect(await screen.findByText('Dashboard Canvas')).toBeVisible()
    expect(await screen.findByText('Layout cards')).toBeVisible()
    const saveButton = await screen.findByText('Save')
    await userEvent.click(saveButton)
    expect(mockedUpdate).toBeCalledTimes(1)
  })

  it('should render empty canvas correctly', async () => {
    mockedGetCanvas.mockImplementation(() => ({
      unwrap: jest.fn().mockResolvedValue([
        {
          id: '65bcb4d334ec4a47b21ae5e062de279f',
          name: 'Canvas',
          content: ''
        }
      ])
    }))
    const { result } = renderHook(() => {
      const [groups, setGroups] = useState([])
      return { groups, setGroups }
    })
    render(
      <Provider>
        <Canvas
          groups={result.current.groups}
          setGroups={result.current.setGroups}
        />
      </Provider>
    )
    expect(await screen.findByText('Dashboard Canvas')).toBeVisible()
    expect(await screen.findByText('Layout')).toBeVisible()
    const saveButton = await screen.findByText('Save')
    await userEvent.click(saveButton)
    expect(mockedUpdate).toBeCalledTimes(1)
  })
})