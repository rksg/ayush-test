import { CONFIG_TEMPLATE_PATH_PREFIX } from '@acx-ui/rc/utils'
import { Provider }                    from '@acx-ui/store'
import { render, screen }              from '@acx-ui/test-utils'

import { ConfigTemplate, ConfigTemplateTabKey } from '.'


jest.mock('./Templates', () => ({
  ...jest.requireActual('./Templates'),
  ConfigTemplateList: () => <div>Config Template List</div>
}))

jest.mock('./Bundles', () => ({
  ...jest.requireActual('./Bundles'),
  ConfigTemplateBundleList: () => <div>Config Template Bundle List</div>
}))

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  goToNotFound: () => <div>NOT FOUND</div>
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

    expect(await screen.findByText('Config Template List')).toBeInTheDocument()
    expect(await screen.findByRole('tab', { name: /Templates/i })).toBeInTheDocument()
    // expect(await screen.findByRole('tab', { name: /Bundles/i })).toBeInTheDocument()

    // await userEvent.click(screen.getByRole('tab', { name: /Bundles/i }))
    // expect(await screen.findByText('Config Template Bundle List')).toBeInTheDocument()
  })

  it('should render ConfigTemplate with unrecognized tab', async () => {
    render(
      <Provider>
        <ConfigTemplate />
      </Provider>, {
        route: {
          params: { tenantId: '__TENANT_ID', activeTab: '-' },
          path
        }
      }
    )

    expect(await screen.findByText('NOT FOUND')).toBeInTheDocument()
  })
})
