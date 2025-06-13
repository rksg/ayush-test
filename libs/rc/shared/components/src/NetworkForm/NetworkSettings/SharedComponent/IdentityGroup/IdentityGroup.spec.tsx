import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { PersonaUrls, DpskUrls, WifiUrlsInfo, ConfigTemplateContext, ServicesConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                                                   from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                        from '@acx-ui/test-utils'

import { mockIdentityGroupQuery, mockIdentityGroupTemplate } from '../../../__tests__/fixtures'
import NetworkFormContext                                    from '../../../NetworkFormContext'

import { IdentityGroup, IdentityGroupDrawer } from './IdentityGroup'

describe('IdentityGroup', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        WifiUrlsInfo.queryDpskService.url,
        (_req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => {
          const searchParams = req.url.searchParams
          if (
            searchParams.get('size') === '10000' &&
            searchParams.get('page') === '0' &&
            searchParams.get('sort') === 'name,asc'
          ) {
            return res(ctx.json(mockIdentityGroupQuery))
          }
          return res(ctx.json(mockIdentityGroupQuery))
        }
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render IdentityGroup correctly', async () => {
    render(
      <Provider>
        <Form>
          <NetworkFormContext.Provider
            value={{
              editMode: false,
              cloneMode: false
            }}
          >
            <IdentityGroup />
          </NetworkFormContext.Provider>
        </Form>
      </Provider>
    )
    const identityDropdown = await screen.findByRole('combobox')
    expect(identityDropdown).toBeInTheDocument()
    await userEvent.click(identityDropdown)
    await userEvent.click(await screen.findByText('IG-1'))
    const associatiionSwitch = await screen.findByTestId(
      'identity-associate-switch'
    )
    expect(associatiionSwitch).toBeInTheDocument()
    await userEvent.click(associatiionSwitch)
    const addIdentityButton = await screen.findByTestId('add-identity-button')
    expect(addIdentityButton).toBeInTheDocument()
  })

  // eslint-disable-next-line max-len
  it('should render IdentityGroupDrawer only with DPSK in Config Template view correctly', async () => {
    const targetDpskName = 'My DPSK Name'
    const spyGetDpskTemplateFn = jest.fn()
    mockServer.use(
      rest.get(
        ServicesConfigTemplateUrlsInfo.getDpsk.url,
        (_, res, ctx) => {
          spyGetDpskTemplateFn()
          return res(ctx.json({ name: targetDpskName }))
        }
      )
    )
    render(
      <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
        <Provider>
          <IdentityGroupDrawer
            visible={true}
            setVisible={jest.fn()}
            personaGroup={{
              ...mockIdentityGroupTemplate,
              dpskPoolId: 'mock-dpsk-pool-template-id'

            }}
          />
        </Provider>
      </ConfigTemplateContext.Provider>,
      { route: {} }
    )

    screen.getByText(new RegExp(mockIdentityGroupTemplate.name))

    await waitFor(() => expect(spyGetDpskTemplateFn).toBeCalled())
    expect(await screen.findByText(new RegExp(targetDpskName))).toBeInTheDocument()

    expect(screen.getByText('DPSK Service')).toBeInTheDocument()
    expect(screen.queryByText('MAC Registration')).not.toBeInTheDocument()
    expect(screen.queryByText('Adaptive Policy Set')).not.toBeInTheDocument()
  })
})
