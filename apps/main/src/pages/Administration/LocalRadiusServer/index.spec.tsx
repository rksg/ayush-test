import { userEvent }         from '@storybook/testing-library'
import { fireEvent, within } from '@testing-library/react'
import { rest }              from 'msw'


import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { RadiusClientConfigUrlsInfo }                            from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import LocalRadiusServer from './index'


describe('RadiusServerTab', () => {

  const config = { secret: '12345', ipAddress: ['210.58.90.234', '210.58.90.235'] }

  const radiusSetting = { host: '31.2.5.12', authenticationPort: 1812, accountingPort: 1813 }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    mockServer.use(
      rest.get(
        RadiusClientConfigUrlsInfo.getRadiusClient.url,
        (req, res, ctx) => res(ctx.json(config))
      ),
      rest.patch(
        RadiusClientConfigUrlsInfo.updateRadiusClient.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        RadiusClientConfigUrlsInfo.getRadiusServerSetting.url,
        (req, res, ctx) => res(ctx.json(radiusSetting))
      )
    )
  })

  it('should render radius config correctly', async () => {

    render(<Provider><LocalRadiusServer /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const eyeButton = await screen.findByTestId('EyeOpenSolid')
    expect(eyeButton).toBeTruthy()

    expect(await screen.findByText(config.ipAddress[0])).toBeVisible()
    expect(await screen.findByText(radiusSetting.host)).toBeVisible()
    expect(await screen.findByText(radiusSetting.authenticationPort)).toBeVisible()
    expect(await screen.findByText(radiusSetting.accountingPort)).toBeVisible()
  })

  it('should change secret correctly', async () => {

    render(<Provider><LocalRadiusServer /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await screen.findByText('RADIUS Host')

    const changeButton = screen.getByRole('button', { name: 'Change' })
    expect(changeButton).toBeTruthy()
    await userEvent.click(changeButton)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toBeTruthy()

    const saveButton = screen.getByRole('button', { name: 'Save' })
    expect(cancelButton).toBeTruthy()

    // screen.getByRole('img111', { name: 'caret-down' })

    const input = await screen.findByRole('textbox')
    await userEvent.type(input, '123457890')

    const generateButton = screen.getByRole('button', { name: 'Generate New Passphrase' })
    expect(generateButton).toBeTruthy()
    await userEvent.click(generateButton)

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await userEvent.click(saveButton)
  })

  it('should change secret and cancel correctly', async () => {

    render(<Provider><LocalRadiusServer /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await screen.findByText('RADIUS Host')

    const changeButton = screen.getByRole('button', { name: 'Change' })
    expect(changeButton).toBeTruthy()
    await userEvent.click(changeButton)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    expect(cancelButton).toBeTruthy()
    await userEvent.click(cancelButton)
  })

  it('should show drawer correctly', async () => {
    render(<Provider><LocalRadiusServer /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await screen.findByText('RADIUS Host')

    // add drawer
    const addAddressButton = screen.getByRole('button', { name: 'Add IP Address' })
    expect(addAddressButton).toBeTruthy()
    await userEvent.click(addAddressButton)

    expect(screen.getByRole('checkbox', { name: 'Add Another IP Address' })).toBeTruthy()
    const addressInput = screen.getByRole('textbox', { name: 'IP Address' })
    expect(addressInput).toHaveValue('')

    // edit drawer
    const row = await screen.findByRole('row', { name: config.ipAddress[0] })
    fireEvent.click(within(row).getByRole('radio'))
    const editButton = screen.getByRole('button', { name: 'Edit' })
    await userEvent.click(editButton)
    expect(addressInput).toHaveValue(config.ipAddress[0])
  })

  it('should delete ip address correctly', async () => {
    render(<Provider><LocalRadiusServer /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await screen.findByText('RADIUS Host')

    const row = await screen.findByRole('row', { name: config.ipAddress[0] })
    await userEvent.click(within(row).getByRole('radio'))
    const deleteButton = screen.getByRole('button', { name: 'Delete' })
    await userEvent.click(deleteButton)

    await screen.findByText('Delete "' + config.ipAddress[0] + '"?')

    await userEvent.click(await screen.findByRole('button', { name: 'Delete IP address' }))
  })
})
