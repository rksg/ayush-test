import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { useGetEdgeOltListQuery }                      from '@acx-ui/rc/services'
import { EdgeOltFixtures }                             from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { screen, renderHook, render, waitFor, within } from '@acx-ui/test-utils'

import useEdgeNokiaOltTable from './OltTable'

const { mockOltList } = EdgeOltFixtures
const mockOpenAddDrawer = jest.fn()
jest.mock('@acx-ui/edge/components', () => {
  const { forwardRef } = jest.requireActual('react')
  return {
    EdgeNokiaOltTable: forwardRef((_props, ref) => {
      ref.current = { openAddDrawer: mockOpenAddDrawer }
      return <div data-testid='EdgeNokiaOltTable'/>
    })
  }
})

jest.mock('@acx-ui/rc/services', () => ({
  useGetEdgeOltListQuery: jest.fn()
    .mockReturnValue({ data: [], isLoading: false, isFetching: false })
}))

// eslint-disable-next-line max-len
const MockComponent = (props: { title?: string, headerExtra?: React.ReactNode, component?: React.ReactNode }) => <div>
  <div data-testid='title'>{props.title}</div>
  <div data-testid='headerExtra'>{props.headerExtra}</div>
  <div data-testid='component'>{props.component}</div>
</div>

describe('useEdgeNokiaOltTable', () => {

  it('returns undefined when isEdgeOltEnabled is false', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const { result } = renderHook(() => useEdgeNokiaOltTable(), { wrapper: Provider })
    expect(result.current).toEqual(undefined)
  })

  // eslint-disable-next-line max-len
  it('returns an object with the correct title, headerExtra, and component when isEdgeOltEnabled is true', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true);
    (useGetEdgeOltListQuery as jest.Mock).mockReturnValue({
      data: mockOltList, isLoading: false, isFetching: false
    })
    const { result } = renderHook(() => useEdgeNokiaOltTable(), { wrapper: Provider })
    await waitFor(() => expect(result.current).toBeDefined())

    render(<MockComponent
      title={result.current?.title}
      headerExtra={result.current?.headerExtra}
      component={result.current?.component}
    />)
    expect(screen.getByTestId('headerExtra')).not.toBeEmptyDOMElement()
    expect(within(screen.getByTestId('component')).getByTestId('EdgeNokiaOltTable')).toBeVisible()
    expect(await screen.findByTestId('title')).toHaveTextContent('Optical (1)')
  })

  it('calls the handleAddOlt function when the button is clicked', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true);
    (useGetEdgeOltListQuery as jest.Mock).mockReturnValue({
      data: mockOltList, isLoading: false, isFetching: false
    })
    const { result } = renderHook(() => useEdgeNokiaOltTable(), { wrapper: Provider })
    await waitFor(() => expect(result.current).toBeDefined())
    render(<MockComponent
      title={result.current?.title}
      headerExtra={result.current?.headerExtra}
      component={result.current?.component}
    />)

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockOpenAddDrawer).toBeCalledTimes(1)
    expect(await screen.findByTestId('title')).toHaveTextContent('Optical (1)')
  })
})