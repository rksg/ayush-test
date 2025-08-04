import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                                         from '@acx-ui/msp/utils'
import { CONFIG_TEMPLATE_PATH_PREFIX, ConfigTemplate, ConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                            from '@acx-ui/store'
import { mockServer, render, screen }                                          from '@acx-ui/test-utils'

import { mockedConfigTemplateList, mockedMSPCustomerList } from '../__tests__/fixtures'

import { AppliedToTenantDrawer } from '.'

const mockedUsedNavigate = jest.fn()
const mockedLocation = '/test'
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => mockedLocation
}))

describe('AppliedToTenantDrawer component', () => {
  const path = `/:tenantId/v/${CONFIG_TEMPLATE_PATH_PREFIX}/templates`
  const params = { tenantId: '__TENANT_ID' }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getConfigTemplates.url,
        (req, res, ctx) => res(ctx.json({ ...mockedConfigTemplateList }))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedMSPCustomerList }))
      )
    )
  })
  it('should render drawer with data', async () => {
    const selectedTemplate = mockedConfigTemplateList.data[0]
    const mspCustomer = mockedMSPCustomerList.data[0]
    const mockSetVisible = jest.fn()
    render(
      <Provider>
        <AppliedToTenantDrawer
          setVisible={mockSetVisible}
          selectedTemplate={selectedTemplate as ConfigTemplate} />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByText(/applied to ec tenants/i)).toBeVisible()
    expect(await screen.findByText(/customers/i)).toBeVisible()
    expect(await screen.findByText(/address/i)).toBeVisible()

    expect((await screen.findByRole('cell', { name: /ec\-1/i })).textContent).toBe(mspCustomer.name)
    expect(await screen.findByRole('cell', {
      name: /350 w java dr, sunnyvale, ca 94089, usa/i
    })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockSetVisible).toHaveBeenCalled()
  })
})
