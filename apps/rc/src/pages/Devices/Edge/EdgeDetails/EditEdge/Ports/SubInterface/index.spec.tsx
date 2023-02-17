import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeUrlsInfo }                                  from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'

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
      rest.post(
        EdgeUrlsInfo.addSubInterfaces.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.patch(
        EdgeUrlsInfo.updateSubInterfaces.url,
        (req, res, ctx) => res(ctx.status(202))
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
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
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
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect((await screen.findAllByRole('row')).length).toBe(11)
  })

  it('Add a DHCP sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterface data={mockEdgePortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('button', { name: 'Add Sub-interface' }))
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '2' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
  })

  it('Add a STATIC sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterface data={mockEdgePortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    await user.click(await screen.findByRole('button', { name: 'Add Sub-interface' }))
    await user.click(await screen.findByRole('combobox', { name: 'IP Assignment Type' }))
    await user.click(await screen.findByText('Static IP'))
    const ipInput = await screen.findByRole('textbox', { name: 'IP Address' })
    fireEvent.change(ipInput, { target: { value: '1.1.1.1' } })
    const subnetInput = await screen.findByRole('textbox', { name: 'Subnet Mask' })
    fireEvent.change(subnetInput, { target: { value: '255.255.255.0' } })
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '2' } })
    await user.click(screen.getByRole('button', { name: 'Add' }))
  })

  it('Edit a sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterface data={mockEdgePortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    const vlanInput = await screen.findByRole('spinbutton', { name: 'VLAN' })
    fireEvent.change(vlanInput, { target: { value: '999' } })
    await user.click(screen.getByRole('button', { name: 'Apply' }))
  })

  it('Delete a sub-interface', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <SubInterface data={mockEdgePortConfig.ports} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    const rows = await screen.findAllByRole('row')
    await user.click(within(rows[1]).getByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2"?')
    await user.click(screen.getByRole('button', { name: 'Delete Sub-Interface' }))
  })

  it('should show no data string when ports data is empty', async () => {
    render(
      <Provider>
        <SubInterface data={[]} />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        }
      })
    expect(screen.getByText('No data to display')).toBeVisible()
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