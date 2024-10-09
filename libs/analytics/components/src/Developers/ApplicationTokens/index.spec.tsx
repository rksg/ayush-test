import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { get }                                                                               from '@acx-ui/config'
import { Provider, rbacApi, rbacApiURL, store }                                              from '@acx-ui/store'
import { cleanup, findTBody, mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'


import { applicationTokens, mockApplicationTokens } from './__fixtures__'
import { ApplicationToken }                         from './services'

import { useApplicationTokens } from '.'

const { click } = userEvent

jest.mock('@acx-ui/config')
jest.mock('./ApplicationTokenForm', () => ({
  ApplicationTokenForm: (props: {
    applicationToken?: ApplicationToken | null,
    onClose: () => void
  }) => {
    if (props.applicationToken === null) return null
    return <div
      data-testid='ApplicationTokenForm'
      onClick={props.onClose}
      children={
        props.applicationToken
          ? `Edit Application Token: ${props.applicationToken.name}`
          : 'Create Application Token'
      }
    />
  }
}))

describe('ApplicationTokensTable', () => {
  describe('RAI', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.mocked(get).mockReturnValue('true')

      mockServer.use(mockApplicationTokens())
    })
    afterEach(() => {
      store.dispatch(rbacApi.util.resetApiState())
      cleanup()
    })
    it('renders table with data and correct columns', async () => {
      const Component = () => {
        const { component } = useApplicationTokens()
        return component
      }
      render(<Component />, { wrapper: Provider, route: {} })

      const tbody = within(await findTBody())
      expect(await tbody.findAllByRole('row')).toHaveLength(applicationTokens.length)
      expect(await screen
        .findAllByRole('columnheader', { name: name => Boolean(name) })).toHaveLength(3)
      const firstRow = (await tbody.findAllByRole('row'))[0]
      const firstRowText = within(firstRow).getAllByRole('cell').map(cell =>
        cell.title)
      expect(firstRowText).toEqual([
        '', // radio
        applicationTokens[0].name,
        '', // client id
        '', // client secret
        '' // settings
      ])
    })
    it('handle edit', async () => {
      const Component = () => {
        const { component } = useApplicationTokens()
        return component
      }
      render(<Component />, { wrapper: Provider, route: {} })

      const element = await findTBody()
      expect(element).toBeVisible()

      const tbody = within(element)
      const applicationToken = applicationTokens[4]
      const targetRow = await tbody.findByRole(
        'row',
        { name: (row) => row.includes(applicationToken.name) }
      )

      await click(targetRow)
      await click(await screen.findByRole('button', { name: 'Edit' }))

      const form = await screen.findByTestId('ApplicationTokenForm')
      expect(form).toBeVisible()
      expect(form).toHaveTextContent(`Edit Application Token: ${applicationToken.name}`)

      await click(form)

      expect(form).not.toBeInTheDocument()
    })
    it('handle create', async () => {
      const Component = () => {
        const { component } = useApplicationTokens()
        return component
      }
      render(<Component />, { wrapper: Provider, route: {} })

      expect(await findTBody()).toBeVisible()

      await click(await screen.findByRole('button', { name: 'Create Application Token' }))

      const form = await screen.findByTestId('ApplicationTokenForm')
      expect(form).toBeVisible()
      expect(form).toHaveTextContent('Create Application Token')

      await click(form)

      expect(form).not.toBeInTheDocument()
    })

    describe('delete', () => {
      const applicationToken = applicationTokens[4]
      const renderElements = async () => {
        const Component = () => {
          const { component } = useApplicationTokens()
          return component
        }
        render(<Component />, { wrapper: Provider, route: {} })

        const element = await findTBody()
        expect(element).toBeVisible()

        const tbody = within(element)
        const targetRow = await tbody
          .findByRole('row', { name: (row) => row.includes(applicationToken.name) })

        await click(targetRow)
        await click(await screen.findByRole('button', { name: 'Delete' }))

        const dialog = await screen.findByRole('dialog')
        expect(dialog).toBeVisible()
        expect(dialog).toHaveTextContent('Are you sure you want to delete this application token?')

        return { dialog, targetRow }
      }
      it('handle delete', async () => {
        const { dialog, targetRow } = await renderElements()

        mockServer.use(
          rest.delete(
            `${rbacApiURL}/applicationTokens/${applicationToken.camId}`,
            (_, res, ctx) => res(ctx.json({ success: true }))
          ),
          mockApplicationTokens(applicationTokens.filter(item => item.id !== applicationToken.id))
        )

        await click(await within(dialog).findByRole('button', { name: 'OK' }))

        await waitForElementToBeRemoved(targetRow)

        expect(await within(await findTBody()).findAllByRole('row'))
          .toHaveLength(applicationTokens.length - 1)

        expect(await screen.findByText('Application token was deleted')).toBeVisible()
      })
      it('handle delete RTKQuery error', async () => {
        const { dialog } = await renderElements()

        mockServer.use(
          rest.delete(
            `${rbacApiURL}/applicationTokens/${applicationToken.camId}`,
            (_, res) => res.networkError('Failed to connect'))
        )

        await click(await within(dialog).findByRole('button', { name: 'OK' }))

        expect(await screen.findByText('Failed to delete application token')).toBeVisible()
      })
      it('handle delete API error', async () => {
        const { dialog } = await renderElements()

        const [status, error] = [500, 'Error from API']
        mockServer.use(
          rest.delete(
            `${rbacApiURL}/applicationTokens/${applicationToken.camId}`,
            (_, res, ctx) => res(
              ctx.status(status),
              ctx.json({ error })
            ))
        )

        await click(await within(dialog).findByRole('button', { name: 'OK' }))

        expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
      })
    })
  })
})
