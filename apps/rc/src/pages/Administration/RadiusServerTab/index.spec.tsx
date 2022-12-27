import { userEvent }         from '@storybook/testing-library'
import { fireEvent, within } from '@testing-library/react'
import { rest }              from 'msw'


import { RadiusClientConfigUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider }                                                   from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, act } from '@acx-ui/test-utils'

import { RadiusServerTab } from './index'

describe('RadiusServerTab', () => {

  const config = { secret: '12345', ipAddress: ['210.58.90.234', '210.58.90.235'] }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RadiusClientConfigUrlsInfo.getRadiusClient.url,
        (req, res, ctx) => res(ctx.json(config))
      ),
      rest.patch(
        RadiusClientConfigUrlsInfo.updateRadiusClient.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render radius config correctly', async () => {
    render(<Provider><RadiusServerTab /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })
    const fieldButton = screen.getByRole('switch', { name: 'Local RADIUS (AAA) Server' })
    fireEvent.click(fieldButton)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const eyeButton = screen.getByRole('img', { name: 'eye-invisible' })
    expect(eyeButton).toBeTruthy()
    fireEvent.click(eyeButton)

    screen.getByRole('row', { name: /210.58.90.234/ })
  })

  it('should change secret correctly', async () => {

    render(<Provider><RadiusServerTab /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    const fieldButton = screen.getByRole('switch', { name: 'Local RADIUS (AAA) Server' })
    fireEvent.click(fieldButton)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const changeButton = screen.getByRole('button', { name: 'Change' })
    expect(changeButton).toBeTruthy()
    fireEvent.click(changeButton)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toBeTruthy()

    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(saveButton).toBeTruthy()

    const generateButton = screen.getByRole('button', { name: 'Generate New Passphrase' })
    expect(generateButton).toBeTruthy()
    fireEvent.click(generateButton)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      fireEvent.click(saveButton)
    })
  })

  it('should show drawer correctly', async () => {
    render(<Provider><RadiusServerTab /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })
    const fieldButton = screen.getByRole('switch', { name: 'Local RADIUS (AAA) Server' })
    fireEvent.click(fieldButton)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // add drawer
    const addAddressButton = screen.getByRole('button', { name: 'Add IP Address' })
    expect(addAddressButton).toBeTruthy()
    fireEvent.click(addAddressButton)
    expect(screen.getByRole('checkbox', { name: 'Add Another IP Address' })).toBeTruthy()
    const addressInput = screen.getByRole('textbox', { name: 'IP Address' })
    expect(addressInput).toHaveValue('')

    // edit drawer
    const row = await screen.findByRole('row', { name: '210.58.90.234' })
    fireEvent.click(within(row).getByRole('radio'))
    const editButton = screen.getByRole('button', { name: 'Edit' })
    fireEvent.click(editButton)
    expect(addressInput).toHaveValue('210.58.90.234')
  })

  it('should delete ip address correctly', async () => {
    render(<Provider><RadiusServerTab /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })
    const fieldButton = screen.getByRole('switch', { name: 'Local RADIUS (AAA) Server' })
    fireEvent.click(fieldButton)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: '210.58.90.234' })
    fireEvent.click(within(row).getByRole('radio'))
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "210.58.90.234"?')

    await userEvent.click(await screen.findByRole('button', { name: 'Delete IP address' }))
  })
})
