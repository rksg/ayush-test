import { fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent                                         from '@testing-library/user-event'
import { rest }                                          from 'msw'

import { RadiusClientConfigUrlsInfo }      from '@acx-ui/rc/utils'
import { Provider }                        from '@acx-ui/store'
import { act, mockServer, render, screen } from '@acx-ui/test-utils'

import { IpAddressDrawer } from './IpAddressDrawer'


describe('IpAddressDrawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.patch(
        RadiusClientConfigUrlsInfo.updateRadiusClient.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should add ip address successfully', async () => {
    render(
      <Provider>
        <IpAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          editMode={false}
          clientConfig={{}}
        />
      </Provider>
    )

    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Add Another IP Address' }))
    // eslint-disable-next-line max-len
    await userEvent.type(await screen.findByRole('textbox', { name: 'IP Address' }), '192.168.11.11')

    let saveButton = screen.getByText('Apply')
    expect(saveButton).toBeTruthy()
    await userEvent.click(saveButton)

    const validating = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating)
  })

  it('should edit ip address successfully', async () => {
    const onCloseFn = jest.fn()
    render(
      <Provider>
        <IpAddressDrawer
          visible={true}
          setVisible={onCloseFn}
          editMode={true}
          clientConfig={{ ipAddress: ['192.168.1.1', '192.168.1.2'] }}
          editIpAddress={'192.168.1.1'}
        />
      </Provider>
    )

    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    const ipaddressInput = await screen.findByRole('textbox', { name: 'IP Address' })
    expect(ipaddressInput).toHaveValue('192.168.1.1')

    await userEvent.clear(ipaddressInput)
    await userEvent.type(ipaddressInput, '192.168.1.2')

    await userEvent.clear(ipaddressInput)
    await userEvent.type(ipaddressInput, '192.168.1.3')
    expect(ipaddressInput).toHaveValue('192.168.1.3')

    let saveButton = screen.getByText('Apply')
    expect(saveButton).toBeTruthy()
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(saveButton)
    })
    await waitFor(() => expect(onCloseFn).toBeCalled())
  })

  it('Add conflict ip address and show error toast correctly', async () => {
    mockServer.use(
      rest.patch(
        RadiusClientConfigUrlsInfo.updateRadiusClient.url,
        (req, res, ctx) => res(ctx.status(409), ctx.json({}))
      )
    )

    render(
      <Provider>
        <IpAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          clientConfig={{}}
        />
      </Provider>
    )
    // eslint-disable-next-line max-len
    await userEvent.type(await screen.findByRole('textbox', { name: 'IP Address' }), '192.168.1.1')
    await userEvent.click(await screen.findByText('Apply'))

    await screen.findByText('IP Address is already used by another tenant')
  })

  it('should cancel drawer successfully', async () => {
    render(
      <Provider>
        <IpAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          editMode={false}
          clientConfig={{}}
        />
      </Provider>
    )

    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

  })

  it('Add show unknown error toast correctly', async () => {
    const mockedFn = jest.fn()
    mockServer.use(
      rest.patch(
        RadiusClientConfigUrlsInfo.updateRadiusClient.url,
        (req, res, ctx) => {
          mockedFn()
          return res(ctx.status(500), ctx.json({}))
        }
      )
    )

    render(
      <Provider>
        <IpAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          clientConfig={{}}
        />
      </Provider>
    )
    // eslint-disable-next-line max-len
    await userEvent.type(await screen.findByRole('textbox', { name: 'IP Address' }), '192.168.1.3')
    await userEvent.click(await screen.findByText('Apply'))

    await waitFor(() => expect(mockedFn).toBeCalled())
    // TODO
    // await screen.findByText('Server Error')
  })
})
