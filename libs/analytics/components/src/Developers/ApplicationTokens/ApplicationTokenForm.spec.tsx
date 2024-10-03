import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { get }                                       from '@acx-ui/config'
import { notificationApi, Provider, rbacApi, store } from '@acx-ui/store'
import { mockServer, render, screen, waitFor }       from '@acx-ui/test-utils'

import { applicationTokens }                            from './__fixtures__'
import { ApplicationTokenForm }                         from './ApplicationTokenForm'
import { ApplicationTokenDto, applicationTokenDtoKeys } from './services'

const { click, type, clear } = userEvent

jest.mock('@acx-ui/config')
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    filterOption,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{
    filterOption: () => void,
    showSearch: boolean,
    onChange?: (value: string) => void
  }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'

  // override so it available for query in testing-library
  components.Input.Password = components.Input
  return { ...components, Select }
})

describe('ApplicationTokenForm', () => {
  const renderCreateAndFillIn = async (isRAI = true) => {
    const dto: ApplicationTokenDto = {
      name: 'Token Name',
      clientId: '123',
      clientSecret: '456'
    }

    const onClose = jest.fn()
    render(<ApplicationTokenForm {...{ onClose }} />, { wrapper: Provider })

    // ensure name field visible before trigger validation
    const name = await screen.findByRole('textbox', { name: 'Name' })

    // trigger required validations
    await click(await screen.findByRole('button', { name: 'Create' }))

    expect(await screen.findAllByRole('alert', {
      name: (_, el) => el.textContent!.includes('Please enter')
    })).toHaveLength(isRAI ? 4 : 3)

    expect(await screen.findByRole('alert', {
      name: (_, el) => el.textContent!.includes('Please enter a valid URL')
    })).toBeVisible()

    await type(name, dto.name)
    return { dto, onClose }
  }

  const applicationToken = applicationTokens[6]
  const renderEditAndFillIn = async () => {
    const dto: ApplicationTokenDto = _.pick(applicationToken, applicationTokenDtoKeys)
    const editedDto: ApplicationTokenDto = {
      name: `${dto.name}-edited`,
      clientId: dto.clientId,
      clientSecret: dto.clientSecret
    }

    const onClose = jest.fn()
    render(
      <ApplicationTokenForm {...{ onClose, applicationToken: applicationToken }} />,
      { wrapper: Provider }
    )

    // ensure name field visible before trigger validation
    const [name, clientSecret] = [
      await screen.findByRole('textbox', { name: 'Name' }),
      await screen.findByRole('textbox', { name: 'Client Secret' })
    ]

    await clear(name)
    await type(name, editedDto.name)
    await clear(clientSecret)
    await type(clientSecret, editedDto.clientSecret)

    return { dto, onClose }
  }

  describe('RAI', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.mocked(get).mockReturnValue('true')

      // mockServer.use(mockResourceGroups())
    })

    afterEach(() => {
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })

    describe('Create new Webhook', () => {
      it('handle create flow', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderCreateAndFillIn()

        // mockServer.use(
        //   rest.post(webhooksUrl(), (req, res, ctx) => {
        //     payloadSpy(req.body)
        //     return res(ctx.json({ success: true }))
        //   })
        // )
        await click(await screen.findByRole('button', { name: 'Create' }))

        expect(await screen.findByText('Webhook was created')).toBeVisible()
        expect(payloadSpy).toBeCalledWith(dto)
        await waitFor(() => expect(onClose).toBeCalledTimes(1))
      })
      it('handle RTKQuery error', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderCreateAndFillIn()

        // mockServer.use(
        //   rest.post(webhooksUrl(), (req, res) => {
        //     payloadSpy(req.body)
        //     return res.networkError('Failed to connect')
        //   })
        // )
        await click(await screen.findByRole('button', { name: 'Create' }))

        expect(await screen.findByText('Failed to create webhook')).toBeVisible()
        expect(payloadSpy).toBeCalledWith(dto)
        expect(onClose).not.toBeCalled()
      })
      it('handle API error', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderCreateAndFillIn()

        const [status, error] = [500, 'Error from API']
        // mockServer.use(
        //   rest.post(webhooksUrl(), (req, res, ctx) => {
        //     payloadSpy(req.body)
        //     return res(ctx.status(status), ctx.json({ error }))
        //   })
        // )
        await click(await screen.findByRole('button', { name: 'Create' }))

        expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
        expect(payloadSpy).toBeCalledWith(dto)
        expect(onClose).not.toBeCalled()
      })
    })

    describe('Update existing Webhook', () => {
      it('handle edit flow', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderEditAndFillIn()

        // mockServer.use(
        //   rest.put(webhooksUrl(webhook.id), (req, res, ctx) => {
        //     payloadSpy(req.body)
        //     return res(ctx.json({ success: true }))
        //   })
        // )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Webhook was updated')).toBeVisible()
        expect(payloadSpy).toBeCalledWith(dto)
        await waitFor(() => expect(onClose).toBeCalledTimes(1))
      })
      it('handle RTKQuery error', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderEditAndFillIn()

        // mockServer.use(
        //   rest.put(webhooksUrl(webhook.id), (req, res) => {
        //     payloadSpy(req.body)
        //     return res.networkError('Failed to connect')
        //   })
        // )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Failed to update webhook')).toBeVisible()
        expect(payloadSpy).toBeCalledWith(dto)
        expect(onClose).not.toBeCalled()
      })
      it('handle API error', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderEditAndFillIn()

        const [status, error] = [500, 'Error from API']
        // mockServer.use(
        //   rest.put(webhooksUrl(webhook.id), (req, res, ctx) => {
        //     payloadSpy(req.body)
        //     return res(ctx.status(status), ctx.json({ error }))
        //   })
        // )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
        expect(payloadSpy).toBeCalledWith(dto)
        expect(onClose).not.toBeCalled()
      })
    })
  })

  describe('R1', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.mocked(get).mockReturnValue('')

      // mockServer.use(mockResourceGroups())
    })

    afterEach(() => {
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })

    describe('Create new Webhook', () => {
      it('handle create flow', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderCreateAndFillIn(false)

        // mockServer.use(
        //   rest.post(webhooksUrl(), (req, res, ctx) => {
        //     payloadSpy(req.body)
        //     return res(ctx.json({ success: true }))
        //   })
        // )
        await click(await screen.findByRole('button', { name: 'Create' }))

        expect(await screen.findByText('Webhook was created')).toBeVisible()
        expect(payloadSpy).toBeCalledWith(dto)
        await waitFor(() => expect(onClose).toBeCalledTimes(1))
      })
    })

    describe('Update existing Webhook', () => {
      it('handle edit flow', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderEditAndFillIn()

        // mockServer.use(
        //   rest.put(webhooksUrl(webhook.id), (req, res, ctx) => {
        //     payloadSpy(req.body)
        //     return res(ctx.json({ success: true }))
        //   })
        // )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Webhook was updated')).toBeVisible()
        expect(payloadSpy).toBeCalledWith(dto)
        await waitFor(() => expect(onClose).toBeCalledTimes(1))
      })
    })
  })

  describe('SendSampleIncident', () => {
    const name = 'Send Sample Incident'
    it('disabled when required field empty', async () => {
      const onClose = jest.fn()
      render(<ApplicationTokenForm {...{ onClose }} />, { wrapper: Provider })

      expect(await screen.findByRole('button', { name })).toBeDisabled()
    })
    it('send sample and render details', async () => {
      const [payloadSpy, onClose] = [jest.fn(), jest.fn()]

      render(
        <ApplicationTokenForm {...{ onClose, applicationToken: applicationToken }} />,
        { wrapper: Provider })

      // const status = 200
      // const data = '<html>\n  <body>\n    <h1>Code Details</h1>\n  </body>\n</html>'

      // mockServer.use(
      //   rest.post(webhooksUrl('send-sample-incident'), (req, res, ctx) => {
      //     payloadSpy(req.body)
      //     return res(ctx.json({ status, data, success: true }))
      //   })
      // )

      await click(await screen.findByRole('button', { name }))

      const dialog = await screen.findByRole('dialog', {
        name: (_, el) => el.textContent!.includes('Sample Incident Sent')
      })
      expect(dialog).toBeVisible()
      expect(payloadSpy).toBeCalledWith(_.pick(applicationToken, ['clientSecret']))
      await click(await screen.findByRole('button', { name: 'OK' }))
    })
    it('send sample and render details (object)', async () => {
      const [payloadSpy, onClose] = [jest.fn(), jest.fn()]

      render(
        <ApplicationTokenForm {...{ onClose, applicationToken: applicationToken }} />,
        { wrapper: Provider }
      )

      // const status = 200
      // const data = { abc: 1, message: 'message' }

      // mockServer.use(
      //   rest.post(webhooksUrl('send-sample-incident'), (req, res, ctx) => {
      //     payloadSpy(req.body)
      //     return res(ctx.json({ status, data, success: true }))
      //   })
      // )

      await click(await screen.findByRole('button', { name }))

      const dialog = await screen.findByRole('dialog', {
        name: (_, el) => el.textContent!.includes('Sample Incident Sent')
      })
      expect(dialog).toBeVisible()
      expect(payloadSpy).toBeCalledWith(_.pick(applicationToken, ['callbackUrl', 'clientSecret']))
      await click(await screen.findByRole('button', { name: 'OK' }))
    })
    it('handle RTKQuery error', async () => {
      const [payloadSpy, onClose] = [jest.fn(), jest.fn()]

      render(
        <ApplicationTokenForm {...{ onClose, applicationToken: applicationToken }} />,
        { wrapper: Provider }
      )

      // mockServer.use(
      //   rest.post(webhooksUrl('send-sample-incident'), (req, res) => {
      //     payloadSpy(req.body)
      //     return res.networkError('Failed to connect')
      //   })
      // )

      await click(await screen.findByRole('button', { name }))

      expect(await screen.findByText('Failed to send sample incident')).toBeVisible()
      expect(payloadSpy).toBeCalledWith(_.pick(applicationToken, ['callbackUrl', 'clientSecret']))
      expect(onClose).not.toBeCalled()
    })
    it('handle API error', async () => {
      const [payloadSpy, onClose] = [jest.fn(), jest.fn()]

      render(
        <ApplicationTokenForm {...{ onClose, applicationToken: applicationToken }} />,
        { wrapper: Provider }
      )

      const [status, error] = [500, 'Error from API']
      // mockServer.use(
      //   rest.post(webhooksUrl('send-sample-incident'), (req, res, ctx) => {
      //     payloadSpy(req.body)
      //     return res(ctx.status(status), ctx.json({ error }))
      //   })
      // )

      await click(await screen.findByRole('button', { name }))

      expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
      expect(payloadSpy).toBeCalledWith(_.pick(applicationToken, ['clientSecret']))
      expect(onClose).not.toBeCalled()
    })
  })
})
