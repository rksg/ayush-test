import { CONFIG_TEMPLATE_PATH_PREFIX } from '@acx-ui/rc/utils'
import { render, screen }              from '@acx-ui/test-utils'

import { ConfigTemplateTabKey } from '..'

import { ConfigTemplateBundleList } from '.'

describe('ConfigTemplateBundleList', () => {
  const path = `/:tenantId/v/${CONFIG_TEMPLATE_PATH_PREFIX}/:activeTab`
  const params = { tenantId: '__TENANT_ID', activeTab: ConfigTemplateTabKey.BUNDLES }

  it('should render bundle list', async () => {
    render(
      <ConfigTemplateBundleList />, {
        route: { params, path }
      }
    )

    expect(screen.getByText('Bundle List')).toBeInTheDocument()
  })
})
