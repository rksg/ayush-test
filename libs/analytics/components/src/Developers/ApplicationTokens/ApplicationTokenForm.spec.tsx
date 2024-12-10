import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { get }                                  from '@acx-ui/config'
import { Provider, rbacApi, rbacApiURL, store } from '@acx-ui/store'
import { mockServer, render, screen, waitFor }  from '@acx-ui/test-utils'

import { applicationTokens, mockApplicationTokens }     from './__fixtures__'
import { ApplicationTokenForm }                         from './ApplicationTokenForm'
import { ApplicationTokenDto, applicationTokenDtoKeys } from './services'

const { click, type } = userEvent

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
  components.Input.Password = ({
    bordered,
    iconRender,
    value,
    onChange,
    ...props
  }: {
    bordered: boolean,
    iconRender: (visible: boolean) => React.ReactNode,
  } & React.InputHTMLAttributes<HTMLInputElement>) => {
    return <input value={value} onChange={onChange || (() => {})} {...props} />
  }

  return { ...components, Select }
})
jest.mock('@acx-ui/components', () => {
  const actual = jest.requireActual('@acx-ui/components')
  return {
    ...actual,
    Loader: ({ children }: React.PropsWithChildren) => {
      return <div data-testid='mocked-loader'>
        <div data-testid='loader-children'>{children}</div>
      </div>
    }
  }
})

describe('ApplicationTokenForm', () => {
  const renderCreateAndFillIn = async () => {
    const dto: ApplicationTokenDto = {
      name: 'Token Name'
    }

    const onClose = jest.fn()
    render(<ApplicationTokenForm {...{ onClose }} />, { wrapper: Provider })

    // ensure name field visible before trigger validation
    const name = await screen.findByRole('textbox', { name: 'Token Name' })

    await type(name, dto.name)
    return { dto, onClose }
  }

  const applicationToken = applicationTokens[6]
  const renderEditAndRotate = async () => {
    const dto: ApplicationTokenDto = _.pick(applicationToken, applicationTokenDtoKeys)

    const onClose = jest.fn()
    render(
      <ApplicationTokenForm {...{ onClose, applicationToken }} />,
      { wrapper: Provider }
    )

    return { dto, onClose }
  }

  beforeEach(() => {
    jest.resetModules()
    jest.mocked(get).mockReturnValue('true')

    mockServer.use(mockApplicationTokens())
  })

  afterEach(() => {
    store.dispatch(rbacApi.util.resetApiState())
  })

  describe('Create new application token', () => {
    it('handle create flow', async () => {
      const payloadSpy = jest.fn()
      const { dto, onClose } = await renderCreateAndFillIn()

      mockServer.use(
        rest.post(`${rbacApiURL}/applicationTokens`, (req, res, ctx) => {
          payloadSpy(req.body)
          return res(ctx.json(applicationTokens[6]))
        })
      )
      await click(await screen.findByRole('button', { name: 'Create' }))

      expect(await screen.findByText('Application token was created')).toBeVisible()
      expect(payloadSpy).toBeCalledWith(dto)
      await waitFor(() => expect(onClose).toBeCalledTimes(1))
    })
    it('handle RTKQuery error', async () => {
      const payloadSpy = jest.fn()
      const { dto, onClose } = await renderCreateAndFillIn()

      mockServer.use(
        rest.post(`${rbacApiURL}/applicationTokens`, (req, res) => {
          payloadSpy(req.body)
          return res.networkError('Failed to connect')
        })
      )
      await click(await screen.findByRole('button', { name: 'Create' }))

      expect(await screen.findByText('Failed to create application token')).toBeVisible()
      expect(payloadSpy).toBeCalledWith(dto)
      expect(onClose).not.toBeCalled()
    })
    it('handle API error', async () => {
      const payloadSpy = jest.fn()
      const { dto, onClose } = await renderCreateAndFillIn()

      const [status, error] = [500, 'Error from API']
      mockServer.use(
        rest.post(`${rbacApiURL}/applicationTokens`, (req, res, ctx) => {
          payloadSpy(req.body)
          return res(ctx.status(status), ctx.json({ error }))
        })
      )
      await click(await screen.findByRole('button', { name: 'Create' }))

      expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
      expect(payloadSpy).toBeCalledWith(dto)
      expect(onClose).not.toBeCalled()
    })
  })

  describe('Handle existing application token', () => {
    beforeAll(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: jest.fn()
        },
        configurable: true
      })
    })
    it('should copy client ID to clipboard', async () => {
      const { onClose } = await renderEditAndRotate()

      await click(await screen.findByTestId('copy-client-id'))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(applicationToken.clientId)

      expect(onClose).not.toBeCalled()
    })

    it('should copy client secret to clipboard', async () => {
      const { onClose } = await renderEditAndRotate()

      await click(await screen.findByTestId('copy-client-secret'))

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(applicationToken.clientSecret)

      expect(onClose).not.toBeCalled()
    })

    it('handle secret rotation', async () => {
      const { dto, onClose } = await renderEditAndRotate()

      mockServer.use(
        rest.patch(`${rbacApiURL}/applicationTokens/${dto.id}`,
          (req, res, ctx) => {
            return res(ctx.json({
              ...dto,
              clientSecret: '32c4d5e357cd424bac3d981bf68a7349'
            }))
          })
      )
      await click(await screen.findByRole('button', { name: 'Rotate Secret' }))

      expect(await screen.findByText('Application token secret was rotated')).toBeVisible()
      expect(onClose).not.toBeCalled()
    })
    it('handle RTKQuery error', async () => {
      const { dto, onClose } = await renderEditAndRotate()

      mockServer.use(
        rest.patch(`${rbacApiURL}/applicationTokens/${dto.id}`,
          (req, res) => {
            return res.networkError('Failed to connect')
          })
      )
      await click(await screen.findByRole('button', { name: 'Rotate Secret' }))

      expect(await screen.findByText('Failed to rotate application token secret')).toBeVisible()
      expect(onClose).not.toBeCalled()
    })
    it('handle API error', async () => {
      const { dto, onClose } = await renderEditAndRotate()

      const [status, error] = [500, 'Error from API']
      mockServer.use(
        rest.patch(`${rbacApiURL}/applicationTokens/${dto.id}`,
          (req, res, ctx) => {
            return res(ctx.status(status), ctx.json({ error }))
          })
      )
      await click(await screen.findByRole('button', { name: 'Rotate Secret' }))

      expect(await screen.findByText(`Error: ${error}. (status code: ${status})`)).toBeVisible()
      expect(onClose).not.toBeCalled()
    })
  })
})
