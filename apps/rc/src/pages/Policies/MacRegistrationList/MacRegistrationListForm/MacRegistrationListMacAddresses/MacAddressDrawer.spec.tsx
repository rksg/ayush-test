import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { MacAddressDrawer } from './MacAddressDrawer'

const macAddress = {
  id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
  expirationDate: '2065-12-08T18:40:01Z',
  revoked: false,
  macAddress: '3A-B8-A9-29-35-D5',
  username: 'ex proident',
  email: 'dolore pariatur adipisicing esse Excepteur',
  location: 'ipsum eiusmod sunt veniam',
  deviceName: 'test'
}

describe('MacAddressDrawer', () => {
  it('should render table with the giving data', async () => {
    const { asFragment } = render(
      <Provider>
        <MacAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={true}
          editData={macAddress}
        />
      </Provider>
    )
    let saveButton = screen.getByText('Done')
    expect(saveButton).toBeTruthy()
    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    fireEvent.click(saveButton)

    expect(asFragment()).toMatchSnapshot()

    const macInput = await screen.findByRole('textbox', { name: 'MAC Address' })
    expect(macInput).toHaveValue(macAddress.macAddress)
    expect(macInput).toBeDisabled()

    const usernameInput = await screen.findByRole('textbox', { name: 'Username' })
    expect(usernameInput).toHaveValue(macAddress.username)

    const deviceNameInput = await screen.findByRole('textbox', { name: 'DeviceName' })
    expect(deviceNameInput).toHaveValue(macAddress.deviceName)
  })

  it('should cancel the drawer successfully', async () => {

    const { asFragment } = render(
      <Provider>
        <MacAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={false}
          editData={undefined}
        />
      </Provider>
    )
    const saveButton = screen.getByText('Add')
    expect(saveButton).toBeTruthy()
    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    fireEvent.click(cancelButton)

    expect(asFragment()).toMatchSnapshot()
  })

  it('should submit the drawer successfully', async () => {

    const { asFragment } = render(
      <Provider>
        <MacAddressDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={false}
          editData={undefined}
        />
      </Provider>
    )
    let saveButton = screen.getByText('Add')
    expect(saveButton).toBeTruthy()
    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    // eslint-disable-next-line max-len
    await userEvent.type(await screen.findByRole('textbox', { name: 'MAC Address' }), '11:22:33:44:55:66')

    fireEvent.click(saveButton)

    expect(asFragment()).toMatchSnapshot()
  })
})
