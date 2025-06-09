import { CONFIG_TEMPLATE_PATH_PREFIX } from '@acx-ui/rc/utils'
import { Provider }                    from '@acx-ui/store'
import { render, screen }              from '@acx-ui/test-utils'

import { ConfigTemplateView } from '.'


jest.mock('./Templates', () => ({
  ...jest.requireActual('./Templates'),
  ConfigTemplateList: () => <div>Config Template List</div>
}))

describe('ConfigTemplate', () => {
  it('should render ConfigTemplate with Templates tab', async () => {
    render(
      <Provider>
        <ConfigTemplateView ApplyTemplateDrawer={jest.fn()} />
      </Provider>, {
        route: {
          params: { tenantId: '__TENANT_ID' },
          path: `/:tenantId/v/${CONFIG_TEMPLATE_PATH_PREFIX}/templates`
        }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('heading', { name: /Configuration Templates/i })).toBeInTheDocument()
    expect(await screen.findByText(/Config Template List/i)).toBeInTheDocument()
  })
})
