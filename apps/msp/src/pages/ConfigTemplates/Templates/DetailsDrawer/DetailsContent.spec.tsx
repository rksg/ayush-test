import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                                         from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                                                          from '@acx-ui/msp/utils'
import { CONFIG_TEMPLATE_PATH_PREFIX, ConfigTemplateDriftType, ConfigTemplateType, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                                                             from '@acx-ui/store'
import { mockServer, render, screen }                                                           from '@acx-ui/test-utils'

import { ConfigTemplateTabKey }  from '../..'
import { mockedMSPCustomerList } from '../../__tests__/fixtures'

import { DetailsContent } from './DetailsContent'


jest.mock('../ShowDriftsDrawer', () => ({
  ShowDriftsDrawer: jest.fn(() => <div>Drift Drawer</div>)
}))

describe('DetailsContent', () => {
  const path = `/:tenantId/v/${CONFIG_TEMPLATE_PATH_PREFIX}/:activeTab`
  const params = { tenantId: '__TENANT_ID', activeTab: ConfigTemplateTabKey.TEMPLATES }
  const mockTemplate = {
    id: '1',
    name: 'Template 1',
    createdOn: 1690598400000,
    createdBy: 'Author 1',
    appliedOnTenants: ['t1', '1969e24ce9af4348833968096ff6cb47'],
    type: ConfigTemplateType.NETWORK,
    lastModified: 1690598400000,
    lastApplied: 1690598405000,
    driftStatus: ConfigTemplateDriftType.DRIFT_DETECTED
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedMSPCustomerList }))
      )
    )
  })

  it('renders basic and metadata details correctly', () => {
    render(<Provider>
      <DetailsContent
        template={mockTemplate}
        setAccessControlSubPolicyVisible={jest.fn()}
      />
    </Provider>, { route: { params, path } })

    expect(screen.getByText('Template Name')).toBeInTheDocument()
    expect(screen.getByText(mockTemplate.name)).toBeInTheDocument()
    expect(screen.getByText('Created By')).toBeInTheDocument()
    expect(screen.getByText(mockTemplate.createdBy)).toBeInTheDocument()
  })

  it('renders ShowDriftsDrawer when drift is detected', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <DetailsContent
        template={mockTemplate}
        setAccessControlSubPolicyVisible={jest.fn()}
      />
    </Provider>, { route: { params, path } })

    expect(screen.queryByText('Drift Drawer')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Drift Detected'))

    expect(screen.getByText('Drift Drawer')).toBeInTheDocument()
  })

  it('calls setAccessControlSubPolicyVisible when TemplateNameLink is clicked', async () => {
    const mockedLayer2Template = {
      id: '4',
      name: 'Template 4',
      createdOn: 1690598500000,
      createdBy: 'Author 4',
      type: ConfigTemplateType.LAYER_2_POLICY,
      lastModified: 1690598500000
    }
    const mockedSetAccessControlSubPolicyVisible = jest.fn()

    render(<Provider>
      <DetailsContent
        template={mockedLayer2Template}
        setAccessControlSubPolicyVisible={mockedSetAccessControlSubPolicyVisible}
      />
    </Provider>, { route: { params, path } })

    const templateNameButton = screen.getByRole('button', { name: mockedLayer2Template.name })
    expect(templateNameButton).toBeInTheDocument()

    await userEvent.click(templateNameButton)

    expect(mockedSetAccessControlSubPolicyVisible).toHaveBeenCalledWith(
      expect.objectContaining({
        [PolicyType.LAYER_2_POLICY]: {
          id: mockedLayer2Template.id,
          visible: true,
          drawerViewMode: true
        }
      })
    )
  })
})
