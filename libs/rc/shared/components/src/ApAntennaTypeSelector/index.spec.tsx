
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { ApAntennaTypeEnum }       from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import { ApAntennaTypeSelector } from '.'


describe('ApAntennaTypeSelector', () => {

  it('should render the selector with Venue Edit', async () => {
    const selectedApAntennaType = {
      model: 'R670',
      antennaType: ApAntennaTypeEnum.NARROW
    }
    const mockAntennaTypesChanged = jest.fn()

    render(
      <Provider>
        <Form>
          <ApAntennaTypeSelector model={selectedApAntennaType.model}
            selectedApAntennaType={selectedApAntennaType}
            onAntennaTypeChanged={mockAntennaTypesChanged} />
        </Form>
      </Provider>
    )

    await userEvent.click(await screen.findByRole('combobox', { name: /Antenna Type/ }))
    await userEvent.click(await screen.findByText('Sector'))

    await waitFor(() => {
      expect(mockAntennaTypesChanged).toBeCalledWith({
        model: 'R670',
        antennaType: ApAntennaTypeEnum.SECTOR
      })
    })
  })

  it('should render the selector with AP Edit', async () => {
    const selectedApAntennaType = {
      useVenueSettings: false,
      antennaType: ApAntennaTypeEnum.SECTOR
    }
    const mockAntennaTypesChanged = jest.fn()

    render(
      <Provider>
        <Form>
          <ApAntennaTypeSelector
            selectedApAntennaType={selectedApAntennaType}
            readOnly={selectedApAntennaType.useVenueSettings}
            onAntennaTypeChanged={mockAntennaTypesChanged} />
        </Form>
      </Provider>
    )

    const antTypeCombobox = await screen.findByRole('combobox', { name: /Antenna Type/ })
    await userEvent.click(antTypeCombobox)
    await userEvent.click(await screen.findByText('Narrow'))

    await waitFor(() => {
      expect(mockAntennaTypesChanged).toBeCalledWith(ApAntennaTypeEnum.NARROW)
    })
  })

  it('should render the selector with AP Edit and useVenueSettings', async () => {
    const selectedApAntennaType = {
      useVenueSettings: true,
      antennaType: ApAntennaTypeEnum.SECTOR
    }
    const mockAntennaTypesChanged = jest.fn()

    render(
      <Provider>
        <Form>
          <ApAntennaTypeSelector
            selectedApAntennaType={selectedApAntennaType}
            readOnly={selectedApAntennaType.useVenueSettings}
            onAntennaTypeChanged={mockAntennaTypesChanged} />
        </Form>
      </Provider>
    )
    const antTypeCombobox = await screen.findByRole('combobox', { name: /Antenna Type/ })
    expect(antTypeCombobox).toHaveAttribute('readonly')
  })

})