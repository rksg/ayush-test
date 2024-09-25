import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspUrlsInfo }                                                            from '@acx-ui/msp/utils'
import { configTemplateApi }                                                      from '@acx-ui/rc/services'
import { Provider, store }                                                        from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockedConfigTemplate, mockedMSPCustomers } from './__tests__/fixtures'

import { SelectedCustomersIndicator, ShowDriftsDrawer } from '.'

describe('ShowDriftsDrawer', () => {
  beforeEach(() => {
    store.dispatch(configTemplateApi.util.resetApiState())

    mockServer.use(
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
    expect(await screen.findByText(`Configurations in ${targetInstance.name}`)).toBeInTheDocument()
  })

  it('enables/disable the Sync button when instances are selected/unselected', async () => {
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    expect(await screen.findByRole('button', { name: /Sync/i })).toBeDisabled()

    const targetInstance = mockedMSPCustomers.data[0]
    const targetInstanceNameReg = new RegExp(`Configurations in ${targetInstance.name}`, 'i')

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

    await userEvent.click(await screen.findByRole('button', { name: /Cancel/i }))

    expect(mockSetVisible).toHaveBeenCalledWith(false)
  })

  it('select all instances when Sync all checkbox is clicked', async () => {
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('checkbox', { name: /Sync all drifts for all customers/i }))

    await waitFor(() => {
      const allInstanceElements = screen.queryAllByRole('button', { name: /Configurations in/i })

      for (const instanceElement of allInstanceElements) {
        expect(within(instanceElement).getByRole('checkbox')).toBeChecked()
      }
    })
  })

  it('filter out the instances when the search bar is used', async () => {
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(
      screen.queryAllByRole('button', { name: /Configurations in/i }).length
    ).toBe(mockedMSPCustomers.data.length)

    const searchInput = await screen.findByRole('combobox')

    const targetInstance = mockedMSPCustomers.data[0]

    await userEvent.click(searchInput)
    await userEvent.click(await screen.findByText(targetInstance.name))

    expect(
      screen.queryAllByRole('button', { name: /Configurations in/i }).length
    ).toBe(1)
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

  xit('should call the sync API when the sync button is clicked', async () => {
    render(<Provider>
      <ShowDriftsDrawer setVisible={jest.fn()} selectedTemplate={mockedConfigTemplate} />
    </Provider>)
    const syncButton = await screen.findByRole('button', { name: 'Sync' })
    await userEvent.click(syncButton)
  })
})
