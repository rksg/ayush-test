import { act, renderHook, waitFor }                 from '@testing-library/react'
import userEvent                                    from '@testing-library/user-event'
import { rest }                                     from 'msw'
import { IntlProvider }                             from 'react-intl'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'

import { EdgeSubInterface, EdgeUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import { mockEdgePortConfig, mockEdgeSubInterfaces } from '../../../../__tests__/fixtures'

import SubInterface from '.'

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

jest.mock('./SubInterfaceDrawer', () => (
  ({ visible, data }: { visible: boolean, data?: EdgeSubInterface }) =>
    <div data-testid='subDialog'>
      <label>{visible?'visible':'invisible'}</label>
      <div>{data?.vlan+''}</div>
    </div>
))

describe('EditEdge ports - sub-interface', () => {
  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'ports',
      activeSubTab: 'sub-interface'
    }

    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getSubInterfaces.url,
        (req, res, ctx) => res(ctx.json(mockEdgeSubInterfaces))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteSubInterfaces.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('no SubInterface', async () => {
    render(
      <Provider>
        <SubInterface data={[]} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect(await screen.findByText('No data to display')).toBeVisible()
  })

  it('should create SubInterface successfully', async () => {
    render(
      <Provider>
        <SubInterface data={mockEdgePortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect((await screen.findAllByRole('row')).length).toBe(11)
  })

  it('Delete a sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterface data={mockEdgePortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await act(async () => {
      await user.click(await screen.findByRole('button', { name: 'Delete' }))
    })
    await screen.findByText('Delete "2"?')
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Delete Sub-Interface' }))
    })
  })

  it('should have edit dialog show up', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterface data={mockEdgePortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })

    await screen.findAllByRole('columnheader')
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await act(async () => {
      await user.click(await screen.findByRole('button', { name: 'Edit' }))
    })
    const dialog = await screen.findByTestId('subDialog')
    expect(within(dialog).queryByText('visible')).toBeValid()
    expect(within(dialog).queryByText('2')).toBeValid()
  })

  it('should close subInterface drawer after routed into another subTab', async () => {
    const getWrapper = (basePath: string = '') =>
      ({ children }: { children: React.ReactElement }) => (
        <IntlProvider locale='en'>
          <Provider>
            <MemoryRouter initialEntries={['/t-id/t/devices/edge/001/edit/ports/sub-interface']}>
              <Routes>
                {
                // eslint-disable-next-line max-len
                  <Route path={`${basePath}/:tenantId/t/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab`}
                    element={
                      <div>
                        <SubInterface data={mockEdgePortConfig.ports} />
                        {children}
                      </div>
                    } />
                }
              </Routes>
            </MemoryRouter>
          </Provider>
        </IntlProvider>
      )
    const { result } = renderHook(() => useNavigate(), { wrapper: getWrapper('') })

    await screen.findAllByRole('columnheader')
    await userEvent.click(await screen.findByRole('button', { name: 'Add Sub-interface' }))
    const dialog = await screen.findByTestId('subDialog')
    expect(within(dialog).queryByText('visible')).toBeValid()
    act(() => {
      // eslint-disable-next-line max-len
      result.current(`/${params.tenantId}/t/devices/edge/${params.serialNumber}/edit/${params.activeTab}/ports-general`)
    })

    await waitFor(async () => {
      expect(within(await screen.findByTestId('subDialog')).queryByText('invisible')).toBeValid()
    })
  })
})

// describe('EditEdge static routes api fail', () => {
//   let params: { tenantId: string, serialNumber: string }
//   beforeEach(() => {
//     params = {
//       tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
//       serialNumber: '000000000000'
//     }

//     mockServer.use(
//       rest.get(
//         EdgeUrlsInfo.getStaticRoutes.url,
//         (req, res, ctx) => res(ctx.json(mockStaticRoutes))
//       ),
//       rest.patch(
//         EdgeUrlsInfo.updateStaticRoutes.url,
//         (req, res, ctx) => res(ctx.status(500))
//       )
//     )
//   })

//   it('apply api fail handle', async () => {
//     const user = userEvent.setup()
//     render(
//       <Provider>
//         <StaticRoutes />
//       </Provider>, {
//         route: { params, path: '/:tenantId/devices/edge/:serialNumber/edit/routes' }
//       })
//     await user.click(await screen.findByRole('button', { name: 'Apply Static Routes' }))
//     expect(await screen.findByText('An error occurred')).toBeVisible()
//   })
// })