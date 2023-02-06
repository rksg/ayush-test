import '@testing-library/jest-dom'
import { rest } from 'msw'

import { switchApi }                                                                from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                                           from '@acx-ui/rc/utils'
import { Provider, store }                                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import {
  lagList
} from './__tests__/fixtures'

import { SwitchLagDrawer, SwitchLagModal } from '.'

const params = {
  tenantId: 'tenant-id',
  switchId: 'switch-id'
}

jest.mock('./switchLagModal', () => ({
  SwitchLagModal: () => <div data-testid='switchLagModal' />
}))

describe('SwitchLagDrawer', () => {
  const mockedSetVisible = jest.fn()

  beforeEach(() => {
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(lagList))
      )
    )
  })

  it('should render lag list correctly', async () => {
    render(<Provider>
      <SwitchLagDrawer
        visible={true}
        setVisible={mockedSetVisible} />
    </Provider>, {
      route: { params, path: '/:tenantId/:switchId' }
    })

    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText('test2')
    fireEvent.click(await screen.findByRole('button', { name: /Add LAG/i }))
    expect(await screen.findByTestId('switchLagModal')).toBeVisible()
  })

  //   it('should render ports of switch ICX7150 correctly', async () => {
  //     mockServer.use(
  //       rest.post(
  //         SwitchUrlsInfo.getSwitchPortlist.url,
  //         (req, res, ctx) => res(ctx.json(portlistData_7150))
  //       )
  //     )
  //     const { asFragment } = render(<Provider>
  //       <SwitchPortTable isVenueLevel={true} />
  //     </Provider>, {
  //       route: { params, path: '/:tenantId' }
  //     })

//     await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))
//     await screen.findAllByText('1/1/1')
//     expect(screen.queryByText('Manage LAG')).not.toBeInTheDocument()
//     expect(asFragment()).toMatchSnapshot()
//   })
})
