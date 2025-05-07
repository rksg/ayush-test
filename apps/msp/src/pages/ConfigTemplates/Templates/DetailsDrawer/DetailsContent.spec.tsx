import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                                              from '@acx-ui/msp/utils'
import { CONFIG_TEMPLATE_PATH_PREFIX, ConfigTemplateDriftType, ConfigTemplateType } from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { mockServer, render, screen }                                               from '@acx-ui/test-utils'

import { ConfigTemplateTabKey }  from '../..'
import { mockedMSPCustomerList } from '../../__tests__/fixtures'

import { DetailsContent, DetailsItemList } from './DetailsContent'


jest.mock('../ShowDriftsDrawer', () => ({
  ShowDriftsDrawer: jest.fn(() => <div>Drift Drawer</div>)
}))

jest.mock('./ActivationViewer', () => ({
  ProtectedActivationViewer: jest.fn(() => <div>Activation Viewer</div>),
  ApGroupVenueViewer: jest.fn(() => <div>AP Group Venue</div>)
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
    expect(screen.queryByText('Drift Status')).not.toBeInTheDocument()
    expect(screen.queryByText('Enforcement')).not.toBeInTheDocument()
  })

  it('renders ShowDriftsDrawer when drift is detected', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE_DRIFTS)

    render(<Provider>
      <DetailsContent
        template={{ ...mockTemplate, lastApplied: 1690598405000 }}
        setAccessControlSubPolicyVisible={jest.fn()}
      />
    </Provider>, { route: { params, path } })

    expect(screen.queryByText('Drift Drawer')).not.toBeInTheDocument()

    await userEvent.click(screen.getByText('Drift Detected'))

    expect(screen.getByText('Drift Drawer')).toBeInTheDocument()
  })

  it('renders the enforcement status', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE_ENFORCED)

    render(<Provider>
      <DetailsContent
        template={{ ...mockTemplate, isEnforced: true }}
        setAccessControlSubPolicyVisible={jest.fn()}
      />
    </Provider>, { route: { params, path } })

    expect(screen.getByText('Enforcement')).toBeInTheDocument()
    expect(screen.getByText('Enforced')).toBeInTheDocument()
  })

  it('renders the AP Group Venue', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE_DISPLAYABLE_ACTIVATION)

    render(<Provider>
      <DetailsContent
        template={{ ...mockTemplate, type: ConfigTemplateType.AP_GROUP }}
        setAccessControlSubPolicyVisible={jest.fn()}
      />
    </Provider>, { route: { params, path } })

    expect(screen.getByText('AP Group Venue')).toBeInTheDocument()
  })

  describe('DetailsItemList', () => {
    const mockTitle = 'Test Title'

    it('should render title correctly', () => {
      render(<DetailsItemList title={mockTitle} items={[]} />)
      expect(screen.getByText(mockTitle)).toBeInTheDocument()
    })

    it('should sort items alphabetically', () => {
      const items = ['Zebra', 'Apple', 'Banana']
      render(<DetailsItemList title={mockTitle} items={items} />)

      const renderedItems = screen.getAllByText(/^[A-Za-z]+$/)
      expect(renderedItems).toHaveLength(3)
      expect(renderedItems[0]).toHaveTextContent('Apple')
      expect(renderedItems[1]).toHaveTextContent('Banana')
      expect(renderedItems[2]).toHaveTextContent('Zebra')
    })

    it('should show loading state when isLoading is true', () => {
      render(<DetailsItemList title={mockTitle} items={[]} isLoading={true} />)
      expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
    })

    it('should render all items with ellipsis', () => {
      const items = ['Item 1', 'Item 2', 'Item 3']
      render(<DetailsItemList title={mockTitle} items={items} />)

      items.forEach(item => {
        const element = screen.getByText(item)
        expect(element).toHaveClass('ant-typography-ellipsis')
      })
    })
  })
})
