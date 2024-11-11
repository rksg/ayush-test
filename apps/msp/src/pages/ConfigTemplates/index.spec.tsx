import { CONFIG_TEMPLATE_PATH_PREFIX } from '@acx-ui/rc/utils'
import { Provider }                    from '@acx-ui/store'
import { render, screen }              from '@acx-ui/test-utils'

import { ConfigTemplate, ConfigTemplateTabKey } from '.'


jest.mock('./Templates', () => ({
  ...jest.requireActual('./Templates'),
  ConfigTemplateList: () => <div>Config Template List</div>
}))

describe('ConfigTemplate', () => {
  const path = `/:tenantId/v/${CONFIG_TEMPLATE_PATH_PREFIX}/:activeTab`

  it('should render ConfigTemplate with Templates tab', async () => {
    render(
      <Provider>
        <ConfigTemplate />
      </Provider>, {
        route: {
          params: { tenantId: '__TENANT_ID', activeTab: ConfigTemplateTabKey.TEMPLATES },
          path
        }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('heading', { name: /Configuration Templates/i })).toBeInTheDocument()
    expect(await screen.findByText(/Config Template List/i)).toBeInTheDocument()
  })
})
