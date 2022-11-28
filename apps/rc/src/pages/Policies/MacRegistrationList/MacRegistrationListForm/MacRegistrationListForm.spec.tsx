import { fireEvent } from '@testing-library/react'
import userEvent     from '@testing-library/user-event'
import { rest }      from 'msw'

import {  MacRegListUrlsInfo }                                            from '@acx-ui/rc/utils'
import { Provider }                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'


import MacRegistrationListForm from './MacRegistrationListForm'

const macRegList = {
  id: '373377b0cb6e46ea8982b1c80aabe1fa',
  autoCleanup: true,
  description: '',
  enabled: true,
  expirationEnabled: true,
  name: 'Registration pool',
  priority: 1,
  ssidRegex: 'mac-auth',
  expirationType: 'SPECIFIED_DATE',
  expirationDate: '2022-11-30T07:13:25Z'
}

describe('MacRegistrationListForm', () => {

  it('should edit list successfully', async () => {
    mockServer.use(
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(macRegList))
      )
    )

    const params = { macRegistrationListId: '373377b0cb6e46ea8982b1c80aabe1fa'
      ,action: 'edit', tenantId: 'tenant-id' }

    render(<Provider><MacRegistrationListForm /></Provider>, {
      route: {
        params,
        path: '/:tenantId/:macRegistrationListId/:action' }
    })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    screen.getByRole('heading', { level: 1, name: 'Configure ' + macRegList.name })

    await waitFor(async () => {
      expect(screen.getByLabelText(/policy name/i)).toHaveValue(macRegList.name)
    })

    await userEvent.click(screen.getByRole('radio', { name: /by date/i }))

    await screen.findByRole('button', { name: 'Cancel' })
    await screen.findByRole('button', { name: 'Finish' })
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should create list successfully', async () => {
    render(<Provider><MacRegistrationListForm /></Provider>,
      {
        route: {
          path: '/:tenantId/:macRegistrationListId/:action',
          params: { tenantId: 'tenant-id', macRegistrationListId: macRegList.id, action: 'add'
          }
        }
      })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'test-policy' } })

    await userEvent.click(screen.getByRole('radio', { name: /after/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await screen.findByRole('button', { name: 'Finish' })
    expect(await screen.findByText('test-policy')).toBeVisible()
    expect(await screen.findByText('Accept')).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Back' })).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Finish' }))
  })

  it('should cancel successfully', async () => {
    render(<Provider><MacRegistrationListForm /></Provider>,
      {
        route: {
          path: '/:tenantId/:macRegistrationListId/:action',
          params: { tenantId: 'tenant-id', macRegistrationListId: macRegList.id, action: 'add'
          }
        }
      })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
  })
})
