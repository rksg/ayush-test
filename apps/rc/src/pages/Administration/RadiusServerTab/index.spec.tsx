import { fireEvent } from '@testing-library/react'
import { rest }      from 'msw'

import { RadiusClientConfigUrlsInfo }                            from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { RadiusServerTab } from './index'

describe('RadiusServerTab', () => {

  const config = { secret: '12345', ipAddress: ['210.58.90.234'] }

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RadiusClientConfigUrlsInfo.getRadiusClient.url,
        (req, res, ctx) => res(ctx.json(config))
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

    // const secretInput = await screen.findByRole('textbox', { name: 'Shared Secret' })
    // expect(secretInput).toHaveValue(config.secret)

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

    fireEvent.click(saveButton)
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

    const changeButton = screen.getByRole('button', { name: 'Change' })
    expect(changeButton).toBeTruthy()
    fireEvent.click(changeButton)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toBeTruthy()
    fireEvent.click(cancelButton)

    const addAddressButton = screen.getByRole('button', { name: 'Add IP Address' })
    expect(addAddressButton).toBeTruthy()
    fireEvent.click(addAddressButton)

    screen.getByRole('dialog')
  })
})
