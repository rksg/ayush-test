import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { get }                                       from '@acx-ui/config'
import { notificationApi, Provider, rbacApi, store } from '@acx-ui/store'
import { mockServer, render, screen }                from '@acx-ui/test-utils'

import { webhooks, mockResourceGroups, webhooksUrl, resourceGroups } from './__fixtures__'
import { WebhookDto, webhookDtoKeys }                                from './services'
import { WebhookForm, resourceGroupFilterOption }                    from './WebhookForm'

const { click, selectOptions, type, clear } = userEvent

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

describe('WebhookForm', () => {
  const renderCreateAndFillIn = async (isRAI = true) => {
    const dto: WebhookDto = {
      name: 'Webhook Name',
      callbackUrl: 'https://example.com',
      secret: '123',
      resourceGroupId: webhook.resourceGroupId,
      eventTypes: webhook.eventTypes,
      enabled: false
    }

    const onClose = jest.fn()
    render(<WebhookForm {...{ onClose }} />, { wrapper: Provider })

    // ensure name field visible before trigger validation
    const name = await screen.findByRole('textbox', { name: 'Name' })

    // trigger required validations
    await click(await screen.findByRole('button', { name: 'Save' }))

    expect(await screen.findAllByRole('alert', {
      name: (_, el) => el.textContent!.includes('Please enter')
    })).toHaveLength(isRAI ? 4 : 3)

    // trigger URL validation
    const webhookUrl = await screen.findByRole('textbox', { name: 'Webhook URL' })
    await type(webhookUrl, 'http')
    expect(await screen.findByRole('alert', {
      name: (_, el) => el.textContent!.includes('Please enter a valid URL')
    })).toBeVisible()
    await clear(webhookUrl)

    await type(name, dto.name)
    await type(webhookUrl, dto.callbackUrl)
    await type(await screen.findByRole('textbox', { name: 'Secret' }), dto.secret)
    if (isRAI) {
      await selectOptions(
        await screen.findByRole('combobox', { name: 'Resource Group' }),
        dto.resourceGroupId
      )
    }
    await click(await screen.findByRole('switch', { name: 'Enabled' }))

    const returnDto = isRAI ? dto : _.omit(dto, 'resourceGroupId')
    return { dto: returnDto, onClose }
  }

  const webhook = webhooks[6]
  const renderEditAndFillIn = async (isRAI = true) => {
    const dto: WebhookDto = _.pick(webhook, webhookDtoKeys)
    const editedDto: WebhookDto = {
      name: `${dto.name}-edited`,
      callbackUrl: `${dto.callbackUrl}-edited`,
      secret: `${dto.secret}-edited`,
      eventTypes: dto.eventTypes.slice(0, -2),
      enabled: !dto.enabled,
      resourceGroupId: resourceGroups.find(node => node.id !== dto.resourceGroupId)!.id
    }

    const onClose = jest.fn()
    render(<WebhookForm {...{ onClose, webhook }} />, { wrapper: Provider })

    // ensure name field visible before trigger validation
    const [name, webhookUrl, secret] = [
      await screen.findByRole('textbox', { name: 'Name' }),
      await screen.findByRole('textbox', { name: 'Webhook URL' }),
      await screen.findByRole('textbox', { name: 'Secret' })
    ]

    await clear(name)
    await type(name, editedDto.name)
    await clear(webhookUrl)
    await type(webhookUrl, editedDto.callbackUrl)
    await clear(secret)
    await type(secret, editedDto.secret)

    if (isRAI) {
      await selectOptions(
        await screen.findByRole('combobox', { name: 'Resource Group' }),
        editedDto.resourceGroupId
      )
    }
    await click(await screen.findByRole('checkbox', { name: 'P4 Incidents' }))
    await click(await screen.findByRole('switch', {
      name: dto.enabled ? 'Enabled' : 'Disabled'
    }))

    const returnDto = isRAI ? editedDto : _.omit(editedDto, 'resourceGroupId')
    return { dto: returnDto, onClose }
  }

  describe('RAI', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.mocked(get).mockReturnValue('true')

      mockServer.use(mockResourceGroups())
    })

    afterEach(() => {
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })

    describe('Create new Webhook', () => {
      it('handle create flow', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderCreateAndFillIn()

        mockServer.use(
          rest.post(webhooksUrl(), (req, res, ctx) => {
            payloadSpy(req.body)
            return res(ctx.json({ success: true }))
          })
        )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Webhook created')).toBeVisible()
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(payloadSpy).toBeCalledWith(dto)
      })
      it('handle RTKQuery error', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderCreateAndFillIn()

        mockServer.use(
          rest.post(webhooksUrl(), (req, res) => {
            payloadSpy(req.body)
            return res.networkError('Failed to connect')
          })
        )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Failed to create webhook')).toBeVisible()
        expect(onClose).not.toBeCalled()
        expect(payloadSpy).toBeCalledWith(dto)
      })
      it('handle API error', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderCreateAndFillIn()

        const [status, error] = [500, 'Error from API']
        mockServer.use(
          rest.post(webhooksUrl(), (req, res, ctx) => {
            payloadSpy(req.body)
            return res(ctx.status(status), ctx.json({ error }))
          })
        )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
        expect(onClose).not.toBeCalled()
        expect(payloadSpy).toBeCalledWith(dto)
      })
    })

    describe('Update existing Webhook', () => {
      it('handle edit flow', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderEditAndFillIn()

        mockServer.use(
          rest.put(webhooksUrl(webhook.id), (req, res, ctx) => {
            payloadSpy(req.body)
            return res(ctx.json({ success: true }))
          })
        )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Webhook updated')).toBeVisible()
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(payloadSpy).toBeCalledWith(dto)
      })
      it('handle RTKQuery error', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderEditAndFillIn()

        mockServer.use(
          rest.put(webhooksUrl(webhook.id), (req, res) => {
            payloadSpy(req.body)
            return res.networkError('Failed to connect')
          })
        )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Failed to update webhook')).toBeVisible()
        expect(onClose).not.toBeCalled()
        expect(payloadSpy).toBeCalledWith(dto)
      })
      it('handle API error', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderEditAndFillIn()

        const [status, error] = [500, 'Error from API']
        mockServer.use(
          rest.put(webhooksUrl(webhook.id), (req, res, ctx) => {
            payloadSpy(req.body)
            return res(ctx.status(status), ctx.json({ error }))
          })
        )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
        expect(onClose).not.toBeCalled()
        expect(payloadSpy).toBeCalledWith(dto)
      })
    })
  })

  describe('R1', () => {
    beforeEach(() => {
      jest.resetModules()
      jest.mocked(get).mockReturnValue('')

      mockServer.use(mockResourceGroups())
    })

    afterEach(() => {
      store.dispatch(rbacApi.util.resetApiState())
      store.dispatch(notificationApi.util.resetApiState())
    })

    describe('Create new Webhook', () => {
      it('handle create flow', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderCreateAndFillIn(false)

        mockServer.use(
          rest.post(webhooksUrl(), (req, res, ctx) => {
            payloadSpy(req.body)
            return res(ctx.json({ success: true }))
          })
        )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Webhook created')).toBeVisible()
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(payloadSpy).toBeCalledWith(dto)
      })
    })

    describe('Update existing Webhook', () => {
      it('handle edit flow', async () => {
        const payloadSpy = jest.fn()
        const { dto, onClose } = await renderEditAndFillIn(false)

        mockServer.use(
          rest.put(webhooksUrl(webhook.id), (req, res, ctx) => {
            payloadSpy(req.body)
            return res(ctx.json({ success: true }))
          })
        )
        await click(await screen.findByRole('button', { name: 'Save' }))

        expect(await screen.findByText('Webhook updated')).toBeVisible()
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(payloadSpy).toBeCalledWith(dto)
      })
    })
  })

  describe('SendSampleIncident', () => {
    const name = 'Send Sample Incident'
    it('disabled when required field empty', async () => {
      const onClose = jest.fn()
      render(<WebhookForm {...{ onClose }} />, { wrapper: Provider })

      expect(await screen.findByRole('button', { name })).toBeDisabled()
    })
    it('send sample and render details', async () => {
      const [payloadSpy, onClose] = [jest.fn(), jest.fn()]

      render(<WebhookForm {...{ onClose, webhook }} />, { wrapper: Provider })

      const status = 200
      const data = '<html>\n  <body>\n    <h1>Code Details</h1>\n  </body>\n</html>'

      mockServer.use(
        rest.post(webhooksUrl('send-sample-incident'), (req, res, ctx) => {
          payloadSpy(req.body)
          return res(ctx.json({ status, data, success: true }))
        })
      )

      await click(await screen.findByRole('button', { name }))

      const dialog = await screen.findByRole('dialog', {
        name: (_, el) => el.textContent!.includes('Sample Incident Sent')
      })
      expect(dialog).toBeVisible()
      expect(payloadSpy).toBeCalledWith(_.pick(webhook, ['callbackUrl', 'secret']))
    })
    it('handle error', async () => {
      const [payloadSpy, onClose] = [jest.fn(), jest.fn()]

      render(<WebhookForm {...{ onClose, webhook }} />, { wrapper: Provider })

      const [status, error] = [500, 'Error from API']
      mockServer.use(
        rest.post(webhooksUrl('send-sample-incident'), (req, res, ctx) => {
          payloadSpy(req.body)
          return res(ctx.status(status), ctx.json({ error }))
        })
      )

      await click(await screen.findByRole('button', { name }))

      expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
      expect(onClose).not.toBeCalled()
      expect(payloadSpy).toBeCalledWith(_.pick(webhook, ['callbackUrl', 'secret']))
    })
  })

  describe('resourceGroupFilterOption', () => {
    it('should filter resource groups', () => {
      expect(resourceGroupFilterOption('a', { label: 'aaaaa' })).toBe(true)
      expect(resourceGroupFilterOption('a', { label: 'AAAA' })).toBe(true)
    })
  })
})
