import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                            from '@acx-ui/feature-toggle'
import { edgeApi, edgeTnmServiceApi }                              from '@acx-ui/rc/services'
import { EdgeTnmServiceUrls, EdgeUrlsInfo }                        from '@acx-ui/rc/utils'
import { EdgeOltFixtures, EdgeGeneralFixtures }                    from '@acx-ui/rc/utils'
import { Provider, store }                                         from '@acx-ui/store'
import { screen, renderHook, render, mockServer, waitFor, within } from '@acx-ui/test-utils'

import useEdgeNokiaOltTable from './OltTable'

const { mockEdgeClusterList } = EdgeGeneralFixtures
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

// eslint-disable-next-line max-len
const MockComponent = (props: { title?: string, headerExtra?: React.ReactNode, component?: React.ReactNode }) => <div>
  <div data-testid='title'>{props.title}</div>
  <div data-testid='headerExtra'>{props.headerExtra}</div>
  <div data-testid='component'>{props.component}</div>
</div>

describe('useEdgeNokiaOltTable', () => {
  const mockGetOlt = jest.fn()
  beforeEach(() => {
    jest.resetAllMocks()
    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(edgeTnmServiceApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeClusterList))
      ),
      rest.get(
        EdgeTnmServiceUrls.getEdgeOltList.url,
        (_, res, ctx) => {
          mockGetOlt()
          return res(ctx.json(mockOltList))
        }))
  })

  it('returns undefined when isEdgeOltEnabled is false', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const { result } = renderHook(() => useEdgeNokiaOltTable(), { wrapper: Provider })
    expect(result.current).toEqual(undefined)
    expect(mockGetOlt).not.toBeCalled()
  })

  // eslint-disable-next-line max-len
  it('returns an object with the correct title, headerExtra, and component when isEdgeOltEnabled is true', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEdgeNokiaOltTable(), { wrapper: Provider })
    await waitFor(() => expect(mockGetOlt).toBeCalledTimes(5))
    render(<MockComponent
      title={result.current?.title}
      headerExtra={result.current?.headerExtra}
      component={result.current?.component}
    />)
    expect(screen.getByTestId('headerExtra')).not.toBeEmptyDOMElement()
    expect(within(screen.getByTestId('component')).getByTestId('EdgeNokiaOltTable')).toBeVisible()
    expect(await screen.findByTestId('title')).toHaveTextContent('Optical (5)')
  })

  it('calls the handleAddOlt function when the button is clicked', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const { result } = renderHook(() => useEdgeNokiaOltTable(), { wrapper: Provider })
    await waitFor(() => expect(mockGetOlt).toBeCalledTimes(5))
    render(<MockComponent
      title={result.current?.title}
      headerExtra={result.current?.headerExtra}
      component={result.current?.component}
    />)

    await userEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(mockOpenAddDrawer).toBeCalledTimes(1)
    expect(await screen.findByTestId('title')).toHaveTextContent('Optical (5)')
  })
})