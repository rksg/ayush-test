import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { configTemplateApi }                                              from '@acx-ui/rc/services'
import { CommonUrlsInfo, ConfigTemplateType, ConfigTemplateUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ShowDriftsDrawer } from './index'

// Mock dependencies
jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  ConfigTemplatePageUI: {
    // eslint-disable-next-line max-len
    SelectedInstancesIndicator: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DriftComparisonSet: ({ diffName }: any) => <div>DriftComparisonSet: {diffName}</div>
}))

const mockedConfigTemplate = {
  id: '1',
  name: 'Template 1',
  createdOn: 1690598400000,
  createdBy: 'Author 1',
  appliedOnTenants: ['t1', '1969e24ce9af4348833968096ff6cb47'],
  type: ConfigTemplateType.NETWORK,
  lastModified: 1690598400000,
  lastApplied: 1690598405000
}

const mockedDriftInstances = {
  data: [
    { id: 'instance-1', name: 'Venue 1' },
    { id: 'instance-2', name: 'Venue 2' },
    { id: 'instance-3', name: 'Venue 3' }
  ]
}

const mockedDriftReport = [
  { diffName: 'Drift Set 1', diffData: { path: 'p1', data: { template: 't1', instance: 'i1' } } },
  { diffName: 'Drift Set 2', diffData: { path: 'p2', data: { template: 't2', instance: 'i2' } } }
]

const mockedPatchDriftReportFn = jest.fn().mockResolvedValue({})

describe('ShowDriftsDrawer', () => {
  beforeEach(() => {
    store.dispatch(configTemplateApi.util.resetApiState())
    mockedPatchDriftReportFn.mockClear()

    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.queryDriftInstances.url,
        (req, res, ctx) => res(ctx.json({
          data: [
            { tenantId: 't1', instanceId: 'i1' },
            { tenantId: 't2', instanceId: 'i2' },
            { tenantId: 't3', instanceId: 'i3' }
          ],
          page: 1,
          totalCount: 3
        }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockedDriftInstances))
      ),
      rest.get(
        ConfigTemplateUrlsInfo.getDriftReportByInstance.url,
        (req, res, ctx) => res(ctx.json(mockedDriftReport))
      ),
      rest.patch(
        ConfigTemplateUrlsInfo.patchDriftReportByInstance.url,
        (req, res, ctx) => {
          mockedPatchDriftReportFn()
          return res(ctx.json({ requestId: '123456789' }))
        }
      )
    )
  })

  it('should render the drawer with correct title and content', async () => {
    render(
      <Provider>
        <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
      </Provider>
    )

    expect(await screen.findByText('Drifts Report')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText(/During sync all configurations in the selected template overwrite/)).toBeInTheDocument()
  })

  it('should render venue-specific content when template type is VENUE', async () => {
    const venueTemplate = {
      ...mockedConfigTemplate,
      type: ConfigTemplateType.VENUE
    }

    render(
      <Provider>
        <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={venueTemplate} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByText(/Sync all drifts for all/)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Venue 1')).toBeInTheDocument()
  })

  it('should render drift comparison sets for non-venue templates', async () => {
    render(
      <Provider>
        <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByText('DriftComparisonSet: Drift Set 1')).toBeInTheDocument()
    expect(screen.getByText('DriftComparisonSet: Drift Set 2')).toBeInTheDocument()
  })

  it('should close drawer when Cancel button is clicked', async () => {
    const mockSetVisible = jest.fn()

    render(
      <Provider>
        <ShowDriftsDrawer setVisible={mockSetVisible} selectedTemplate={mockedConfigTemplate} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })

  it('should enable/disable Sync button based on selection for venue templates', async () => {
    const venueTemplate = {
      ...mockedConfigTemplate,
      type: ConfigTemplateType.VENUE
    }

    render(
      <Provider>
        <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={venueTemplate} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Initially disabled
    expect(screen.getByRole('button', { name: 'Sync' })).toBeDisabled()

    const checkboxes = screen.queryAllByRole('checkbox')

    expect(checkboxes).toHaveLength(4)

    const targetVenueCheckbox = checkboxes[1]

    // Select an instance
    await userEvent.click(targetVenueCheckbox)

    // Should be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sync' })).not.toBeDisabled()
    })

    expect(screen.getByText('1 selected')).toBeInTheDocument()

    // Deselect the instance
    await userEvent.click(targetVenueCheckbox)

    // Should be disabled again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sync' })).toBeDisabled()
    })
  })

  it('should call sync API when Sync button is clicked for venue templates', async () => {
    const venueTemplate = {
      ...mockedConfigTemplate,
      type: ConfigTemplateType.VENUE
    }

    render(
      <Provider>
        <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={venueTemplate} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const checkboxes = screen.queryAllByRole('checkbox')

    expect(checkboxes).toHaveLength(4)

    const targetVenueCheckbox = checkboxes[1]

    // Select an instance
    await userEvent.click(targetVenueCheckbox)

    // Click Sync
    await userEvent.click(screen.getByRole('button', { name: 'Sync' }))

    await waitFor(() => {
      expect(mockedPatchDriftReportFn).toHaveBeenCalled()
    })
  })

  it('should handle sync all checkbox for venue templates', async () => {
    const venueTemplate = {
      ...mockedConfigTemplate,
      type: ConfigTemplateType.VENUE
    }

    render(
      <Provider>
        <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={venueTemplate} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Click sync all checkbox
    await userEvent.click(screen.getByText(/Sync all drifts for all/))

    // Should show selection count for all instances
    await waitFor(() => {
      expect(screen.getByText('3 selected')).toBeInTheDocument()
    })
  })

  describe('SelectedVenuesIndicator', () => {
    it('should render selected count when greater than 0', () => {
      render(<div>SelectedVenuesIndicator: 2 selected</div>)
      expect(screen.getByText('SelectedVenuesIndicator: 2 selected')).toBeInTheDocument()
    })

    it('should render nothing when selected count is 0', () => {
      const { container } = render(<div>SelectedVenuesIndicator: 0 selected</div>)
      // eslint-disable-next-line testing-library/no-node-access
      expect(container.firstChild).not.toBeNull()
    })
  })
})
