import userEvent from '@testing-library/user-event'

import { CONFIG_TEMPLATE_PATH_PREFIX, ConfigTemplate, ConfigTemplateDriftType, ConfigTemplateType, PolicyType } from '@acx-ui/rc/utils'
import { Provider }                                                                                             from '@acx-ui/store'
import { render, screen }                                                                                       from '@acx-ui/test-utils'

import { ConfigTemplateTabKey } from '../..'

import { DetailsDrawer } from '.'


const mockedUsedNavigate = jest.fn()
const mockedLocation = '/test'
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => mockedLocation
}))

jest.mock('./DetailsContent', () => ({
  ...jest.requireActual('./DetailsContent'),
  DetailsContent: () => <div>DetailsContent</div>
}))

describe('DetailsDrawer', () => {
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

  const mockedSetVisible = jest.fn()
  const mockedSetAccessControlSubPolicyVisible = jest.fn()

  const renderComponent = (selectedTemplate: ConfigTemplate = mockTemplate) => {
    render(
      <Provider>
        <DetailsDrawer
          setVisible={mockedSetVisible}
          selectedTemplate={selectedTemplate}
          setAccessControlSubPolicyVisible={mockedSetAccessControlSubPolicyVisible}
        />
      </Provider>, {
        route: { params, path }
      }
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the drawer with title and buttons', () => {
    renderComponent()

    expect(screen.getByText('Template Details')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Configure' })).toBeInTheDocument()
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('should close drawer when Close button is clicked', async () => {
    renderComponent()

    await userEvent.click(screen.getByText('Close'))
    expect(mockedSetVisible).toHaveBeenCalledWith(false)
  })

  it('should call doEdit when Configure button is clicked', async () => {
    renderComponent()

    await userEvent.click(screen.getByText('Configure'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith(
      `/__TENANT_ID/v/configTemplates/networks/wireless/${mockTemplate.id}/edit`,
      expect.objectContaining({ state: { from: mockedLocation } })
    )
  })

  it('should call doEdit when Configure button is clicked - isAccessControlSubPolicy', async () => {
    renderComponent({
      id: '4',
      name: 'Template 4',
      createdOn: 1690598500000,
      createdBy: 'Author 4',
      type: ConfigTemplateType.LAYER_2_POLICY,
      lastModified: 1690598500000
    })

    await userEvent.click(screen.getByText('Configure'))
    expect(mockedSetAccessControlSubPolicyVisible).toHaveBeenCalledWith(
      expect.objectContaining({
        [PolicyType.LAYER_2_POLICY]: {
          id: '4',
          visible: true
        }
      })
    )
  })
})
