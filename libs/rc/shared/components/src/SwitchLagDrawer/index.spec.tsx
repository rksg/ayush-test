import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { switchApi }                                                                 from '@acx-ui/rc/services'
import { SwitchUrlsInfo }                                                            from '@acx-ui/rc/utils'
import { Provider, store }                                                           from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  lagList, switchDetailData
} from './__tests__/fixtures'

import { SwitchLagDrawer } from '.'

const params = {
  tenantId: 'tenant-id',
  switchId: 'switch-id'
}

jest.mock('./SwitchLagModal', () => ({
  SwitchLagModal: () => <div data-testid={'switchLagModal'} />
}))

describe('SwitchLagDrawer', () => {
  const mockedSetVisible = jest.fn()
  const mockedGetSwitchDetail = jest.fn()
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.get(
        SwitchUrlsInfo.getLagList.url,
        (req, res, ctx) => res(ctx.json(lagList))
      ),
      rest.get(
        SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => {
          mockedGetSwitchDetail()
          return res(ctx.json(switchDetailData))
        })
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

    await waitFor(() => expect(mockedGetSwitchDetail).toBeCalled())
    await waitForElementToBeRemoved(screen.queryAllByRole('img', { name: 'loader' }))

    await screen.findByText('test-lag')
    fireEvent.click(screen.getByRole('button', { name: /Add LAG/i }))
    expect(await screen.findByTestId('switchLagModal')).toBeVisible()
  })

  it('should delete lag correctly', async () => {
    render(<Provider>
      <SwitchLagDrawer
        visible={true}
        setVisible={mockedSetVisible} />
    </Provider>, {
      route: { params, path: '/:tenantId/:switchId' }
    })

    await screen.findByText('test-lag')
    fireEvent.click(screen.getByRole('button', { name: /Add LAG/i }))
    expect(await screen.findByTestId('switchLagModal')).toBeVisible()

    const deleteBtns = screen.getAllByRole('deleteBtn')
    fireEvent.click(deleteBtns[0])
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
  })

  it('should click edit button correctly', async () => {
    render(<Provider>
      <SwitchLagDrawer
        visible={true}
        setVisible={mockedSetVisible} />
    </Provider>, {
      route: { params, path: '/:tenantId/:switchId' }
    })

    await screen.findByText('test-lag')
    fireEvent.click(screen.getByRole('button', { name: /Add LAG/i }))
    expect(await screen.findByTestId('switchLagModal')).toBeVisible()

    const editBtn = screen.getAllByRole('editBtn')
    await fireEvent.click(editBtn[0])
  })


})
