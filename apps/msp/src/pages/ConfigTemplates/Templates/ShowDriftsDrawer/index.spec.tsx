import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                                            from '@acx-ui/msp/utils'
import { configTemplateApi }                                                      from '@acx-ui/rc/services'
import { ConfigTemplateType, ConfigTemplateUrlsInfo }                             from '@acx-ui/rc/utils'
import { Provider, store }                                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockedConfigTemplate, mockedDriftTenants, mockedMSPCustomers } from './__tests__/fixtures'

import { SelectedCustomersIndicator, ShowDriftsDrawer } from '.'

jest.mock('../CustomerFirmwareReminder', () => ({
  ...jest.requireActual('../CustomerFirmwareReminder'),
  CustomerFirmwareReminder: () => <div>CustomerFirmwareReminder</div>
}))

describe('ShowDriftsDrawer', () => {
  beforeEach(() => {
    store.dispatch(configTemplateApi.util.resetApiState())

    mockServer.use(
      rest.get(
        ConfigTemplateUrlsInfo.getDriftTenants.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(mockedDriftTenants))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(mockedMSPCustomers))
      )
    )
  })

  it('should render the drawer with the correct content', async () => {
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    const targetInstance = mockedMSPCustomers.data[0]
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('checkbox', { name: /Sync all drifts for all customers/i })).toBeInTheDocument()

    expect(await screen.findByRole('combobox')).toBeInTheDocument()
    expect(await screen.findByText(`${targetInstance.name}`)).toBeInTheDocument()
  })

  it('enables/disable the Sync button when instances are selected/unselected', async () => {
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    expect(await screen.findByRole('button', { name: /Sync/i })).toBeDisabled()

    const targetInstance = mockedMSPCustomers.data[0]
    const targetInstanceNameReg = new RegExp(targetInstance.name, 'i')

    const instanceElement = await screen.findByRole('button', { name: targetInstanceNameReg })
    await userEvent.click(within(instanceElement).getByRole('checkbox')) // Select
    await waitFor(() => expect(screen.getByRole('button', { name: /Sync/i })).not.toBeDisabled())

    await userEvent.click(within(instanceElement).getByRole('checkbox')) // Unselect
    await waitFor(() => expect(screen.getByRole('button', { name: /Sync/i })).toBeDisabled())
  })

  it('closes the drawer when Cancel is clicked', async () => {
    const mockSetVisible = jest.fn()
    render(<Provider>
      <ShowDriftsDrawer setVisible={mockSetVisible} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    await userEvent.click(await screen.findByRole('button', { name: /Cancel/i }))

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })

  it('select all instances when Sync all checkbox is clicked', async () => {
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Check all instances
    await userEvent.click(screen.getByRole('checkbox', { name: /Sync all drifts/i }))
    await waitFor(() => {
      for (const instanceElement of screen.queryAllByRole('checkbox')) {
        expect(instanceElement).toBeChecked()
      }
    })

    expect(screen.getByText(`${mockedMSPCustomers.data.length} selected`)).toBeInTheDocument()

    // Uncheck all instances
    await userEvent.click(screen.getByRole('checkbox', { name: /Sync all drifts/i }))
    await waitFor(() => {
      for (const instanceElement of screen.queryAllByRole('checkbox')) {
        expect(instanceElement).not.toBeChecked()
      }
    })
  })

  it('filter out the instances when the search bar is used', async () => {
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const searchInput = await screen.findByRole('combobox')

    const targetInstance = mockedMSPCustomers.data[0]

    await userEvent.type(searchInput, targetInstance.name.slice(0, 3))

    // Select the target instance in the dropdown
    await userEvent.click(
      await screen.findByText(targetInstance.name, { selector: '.ant-select-item-option-content' })
    )

    // Check the target instance is displayed after filtering
    expect(
      await screen.findByRole('button', { name: new RegExp(targetInstance.name, 'i') })
    ).toBeInTheDocument()

    // Check the other instance is not displayed after filtering
    expect(
      screen.queryByRole('button', { name: new RegExp(mockedMSPCustomers.data[1].name, 'i') })
    ).not.toBeInTheDocument()
  })

  it('should call the sync API when the sync button is clicked', async () => {
    const mockPatchDriftReportFn = jest.fn()

    mockServer.use(
      rest.patch(
        ConfigTemplateUrlsInfo.patchDriftReport.url,
        (req, res, ctx) => {
          mockPatchDriftReportFn()
          return res(ctx.json({ requestId: '123456789' }))
        }
      )
    )

    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // Check all instances
    await userEvent.click(screen.getByRole('checkbox', { name: /Sync all drifts/i }))

    await waitFor(() => {
      for (const instanceElement of screen.queryAllByRole('checkbox')) {
        expect(instanceElement).toBeChecked()
      }
    })

    await userEvent.click(screen.getByRole('button', { name: /Sync/i }))

    await waitFor(() => {
      expect(mockPatchDriftReportFn).toHaveBeenCalledTimes(mockedDriftTenants.data.length)
    })
  })

  it('should render the customer firmware reminder', async () => {
    const venueTemplate = {
      id: '1',
      name: 'Template 1',
      createdOn: 1690598400000,
      createdBy: 'Author 1',
      type: ConfigTemplateType.VENUE,
      lastModified: 1690598400000,
      lastApplied: 1690598405000
    }
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={venueTemplate} />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('CustomerFirmwareReminder')).toBeInTheDocument()
  })

  describe('SelectedCustomersIndicator', () => {
    it('should render the selected customer indicator when the instance is selected', async () => {
      render(<SelectedCustomersIndicator selectedCount={1} />)
      expect(await screen.findByText('1 selected')).toBeInTheDocument()
    })

    it('should render nothing when selectedCount is 0', () => {
      const { container } = render(<SelectedCustomersIndicator selectedCount={0} />)
      // eslint-disable-next-line testing-library/no-node-access
      expect(container.firstChild).toBeNull()
    })
  })
})
