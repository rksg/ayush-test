import userEvent from '@testing-library/user-event'

import { ConfigTemplateType }      from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { ApplyTemplateModal } from './index'

jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  ConfigTemplateOverrideModal: () => <div>ConfigTemplateOverrideModal</div>
}))

const mockedApplyRecConfigTemplateFn = jest.fn().mockResolvedValue({})
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  // eslint-disable-next-line max-len
  useApplyRecConfigTemplateMutation: () => [() => ({ unwrap: mockedApplyRecConfigTemplateFn }), { isLoading: false }]
}))

const mockTemplate = {
  id: '1',
  name: 'Template 1',
  createdOn: 1690598400000,
  createdBy: 'Author 1',
  appliedOnTenants: ['t1', '1969e24ce9af4348833968096ff6cb47'],
  type: ConfigTemplateType.NETWORK,
  lastModified: 1690598400000,
  lastApplied: 1690598405000
}

const defaultProps = {
  setVisible: jest.fn(),
  selectedTemplate: mockTemplate
}

describe('ApplyTemplateModal', () => {
  beforeEach(() => {
    mockedApplyRecConfigTemplateFn.mockClear()
    defaultProps.setVisible.mockClear()
  })

  it('should render modal with correct title and content', () => {
    render(
      <Provider>
        <ApplyTemplateModal {...defaultProps} />
      </Provider>
    )

    expect(screen.getByText('Apply Template')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText(/Applying this template will create a new configuration instance/)).toBeInTheDocument()
  })

  it('should render Cancel and Apply buttons', () => {
    render(
      <Provider>
        <ApplyTemplateModal {...defaultProps} />
      </Provider>
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument()
  })

  it('should call setVisible(false) when Cancel button is clicked', async () => {
    render(
      <Provider>
        <ApplyTemplateModal {...defaultProps} />
      </Provider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(defaultProps.setVisible).toHaveBeenCalledWith(false)
  })

  it('should call setVisible(false) when modal is closed', async () => {
    render(
      <Provider>
        <ApplyTemplateModal {...defaultProps} />
      </Provider>
    )

    // Close modal by clicking the close button (X)
    const closeButton = screen.getByRole('button', { name: /close/i })
    await userEvent.click(closeButton)

    expect(defaultProps.setVisible).toHaveBeenCalledWith(false)
  })

  it('should apply template when Apply button is clicked', async () => {
    render(
      <Provider>
        <ApplyTemplateModal {...defaultProps} />
      </Provider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(mockedApplyRecConfigTemplateFn).toHaveBeenCalled()
    })

    expect(defaultProps.setVisible).toHaveBeenCalledWith(false)
  })

  it('should show override modal when Override Template button is clicked', async () => {
    render(
      <Provider>
        <ApplyTemplateModal
          setVisible={jest.fn()}
          selectedTemplate={{
            id: '2',
            name: 'Template 2',
            createdOn: 1690598400000,
            createdBy: 'Author 2',
            appliedOnTenants: [],
            type: ConfigTemplateType.VENUE,
            lastModified: 1690598400000,
            lastApplied: 1690598405000
          }}
        />
      </Provider>
    )

    await userEvent.click(await screen.findByRole('button', { name: 'Override Template' }))

    expect(await screen.findByText('ConfigTemplateOverrideModal')).toBeVisible()
  })

  it('should not show Override Template button when template is not overridable', () => {
    render(
      <Provider>
        <ApplyTemplateModal {...defaultProps} />
      </Provider>
    )

    expect(screen.queryByRole('button', { name: 'Override Template' })).not.toBeInTheDocument()
  })
})
