import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { IpAddressDrawer } from './IpAddressDrawer'


describe('IpAddressDrawer', () => {

  it('should submit drawer successfully', async () => {
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

    let saveButton = screen.getByText('Add')
    expect(saveButton).toBeTruthy()
    let cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeTruthy()

    fireEvent.click(saveButton)

    // eslint-disable-next-line max-len
    await userEvent.type(await screen.findByRole('textbox', { name: 'IP Address' }), '192.168.1.1')
    fireEvent.click(saveButton)
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

    fireEvent.click(cancelButton)
  })
})
