// import { Provider }              from '@acx-ui/store'
import userEvent from '@testing-library/user-event'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { screen, renderHook, render } from '@acx-ui/test-utils'

import useEdgeNokiaOltTable from './OltTable'

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeOltListQuery: jest.fn()
}))

jest.mock('@acx-ui/edge/components', () => ({
  EdgeNokiaOltTable: () => <div data-testid='EdgeNokiaOltTable'/>
}))

describe('useEdgeNokiaOltTable', () => {
  it('returns an empty object when isEdgeOltEnabled is false', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const { result } = renderHook(() => useEdgeNokiaOltTable())
    expect(result.current).toEqual({})
  })

  // eslint-disable-next-line max-len
  it('returns an object with the correct title, headerExtra, and component when isEdgeOltEnabled is true', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEdgeNokiaOltTable())
    render(<div>
      <div data-testid='title'>{result.current.title}</div>
      <div data-testid='headerExtra'>{result.current.headerExtra}</div>
      <div data-testid='component'>{result.current.component}</div>
    </div>)
    expect(screen.getByTestId('title')).toHaveTextContent('OLTs')
    expect(screen.getByTestId('headerExtra')).toBeEmptyDOMElement()
    expect(screen.getByTestId('component')).toHaveTextContent('EdgeNokiaOltTable')
  })

  it('calls the handleAddOlt function when the button is clicked', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    // const useGetEdgeOltListQueryMock = jest.fn(() => ({
    //   data: [{ id: 1, name: 'OLT 1' }],
    //   isLoading: false,
    //   isFetching: false
    // }))
    const handleAddOltMock = jest.fn()
    const { result } = renderHook(() => useEdgeNokiaOltTable())
    const button = result.current.headerExtra[0]
    await userEvent.click(button)
    expect(handleAddOltMock).toHaveBeenCalledTimes(1)
  })

  it('calls the useGetEdgeOltListQuery hook with the correct arguments', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const useGetEdgeOltListQueryMock = jest.fn()
    renderHook(() => useEdgeNokiaOltTable())
    expect(useGetEdgeOltListQueryMock).toHaveBeenCalledTimes(1)
    expect(useGetEdgeOltListQueryMock).toHaveBeenCalledWith({}, { skip: false })
  })
})