import { rest } from 'msw'

import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { configTemplateApi, configTemplateInstanceEnforcedApiMap }          from '@acx-ui/rc/services'
import { ConfigTemplateContext, ConfigTemplateType }                        from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { EnforcedButton } from '.'

describe('EnforcedButton', () => {
  const networkResponseGenerator = jest.fn()

  beforeEach(() => {
    networkResponseGenerator.mockReturnValue(generateEnforcedNetworkResponse(false))

    store.dispatch(configTemplateApi.util.resetApiState())
    mockServer.use(
      rest.post(
        configTemplateInstanceEnforcedApiMap[ConfigTemplateType.NETWORK].url,
        (req, res, ctx) => res(ctx.json(networkResponseGenerator()))
      )
    )
  })

  it('renders enabled button when the FF is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <EnforcedButton
          configTemplateType={ConfigTemplateType.NETWORK}
          instanceId={'12345'}
        >Test Button</EnforcedButton>
      </ConfigTemplateContext.Provider>
    </Provider>)

    expect(screen.getByRole('button')).toBeEnabled()
    expect(screen.getByRole('button')).toHaveTextContent('Test Button')
  })

  it('disables the button and shows tooltip when enforcement is active', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    networkResponseGenerator.mockReturnValue(generateEnforcedNetworkResponse(true))

    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: false }}>
        <EnforcedButton
          configTemplateType={ConfigTemplateType.NETWORK}
          instanceId={'12345'}
        >Test Button</EnforcedButton>
      </ConfigTemplateContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.getByRole('button')).toBeDisabled()

    fireEvent.mouseOver(screen.getByText('Test Button'))
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Action is disabled due to enforcement from the template')
  })

  it('renders enabled button when enforcement is inactive', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    networkResponseGenerator.mockReturnValue(generateEnforcedNetworkResponse(false))

    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: false }}>
        <EnforcedButton
          configTemplateType={ConfigTemplateType.NETWORK}
          instanceId={'12345'}
        >Test Button</EnforcedButton>
      </ConfigTemplateContext.Provider>
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.getByRole('button')).toBeEnabled()
  })

  it('does not check enforcement when isTemplate is true', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <EnforcedButton
          configTemplateType={ConfigTemplateType.NETWORK}
          instanceId={'12345'}
        >Test Button</EnforcedButton>
      </ConfigTemplateContext.Provider>
    </Provider>)

    expect(screen.getByRole('button')).toBeEnabled()
  })
})

function generateEnforcedNetworkResponse (isEnforced: boolean) {
  return {
    fields: ['name', 'id'],
    totalCount: 1,
    page: 1,
    data: [
      {
        name: 'test-psk',
        id: '936ad54680ba4e5bae59ae1eb817ca24',
        isEnforced
      }
    ]
  }
}
