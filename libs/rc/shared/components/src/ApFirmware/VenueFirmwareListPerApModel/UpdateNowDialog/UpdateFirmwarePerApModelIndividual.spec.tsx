import userEvent from '@testing-library/user-event'

import { FirmwareLabel }  from '@acx-ui/rc/utils'
import { render, screen } from '@acx-ui/test-utils'

import { UpdateFirmwarePerApModelIndividual, UpdateFirmwarePerApModelIndividualProps } from './UpdateFirmwarePerApModelIndividual'


describe('UpdateFirmwarePerApModelIndividual', () => {
  const props: UpdateFirmwarePerApModelIndividualProps = {
    apModel: 'R550',
    versionOptions: [
      {
        key: '7.0.0.104.1242',
        label: '7.0.0.104.1242 (Release - Recommended) - 02/27/2024',
        releaseDate: '2024-02-27T07:27:50.582+00:00'
      },
      {
        key: '7.0.0.104.1240',
        label: '7.0.0.104.1240 (Release - Recommended) - 02/25/2024',
        releaseDate: '2024-02-25T07:27:50.582+00:00'
      },
      {
        key: '7.0.0.104.1238',
        label: '7.0.0.104.1238 (Release - Recommended) - 02/23/2024',
        releaseDate: '2024-02-23T07:27:50.582+00:00'
      },
      {
        key: '7.0.0.104.1236',
        label: '7.0.0.104.1236 (Release - Recommended) - 02/21/2024',
        releaseDate: '2024-02-21T07:27:50.582+00:00'
      },
      {
        key: '7.0.0.104.111',
        label: '7.0.0.104.111 (Release - Recommended) - 02/01/2024',
        releaseDate: '2024-02-01T07:27:50.582+00:00'
      }
    ],
    update: jest.fn(),
    defaultVersion: '7.0.0.104.1242',
    extremeFirmware: '7.0.0.104.1242',
    labelSize: 'small',
    emptyOptionLabel: 'Do not update firmware',
    noOptionsMessage: 'The AP is up-to-date',
    isUpgrade: true
  }

  const earlyAccessProps: UpdateFirmwarePerApModelIndividualProps = {
    apModel: 'R750',
    versionOptions: [],
    extremeFirmware: '7.1.1.520.214',
    update: jest.fn(),
    earlyAccess: true,
    defaultVersion: '',
    labelSize: 'large',
    selectedVenuesFirmwares: [
      {
        id: '7.1.1.520.214',
        name: '7.1.1.520.214',
        currentApFirmwares: [
          {
            apModel: 'R750',
            firmware: '7.1.1.520.214',
            labels: [FirmwareLabel.ALPHA]
          }
        ]
      }
    ],
    isUpgrade: true
  }

  it('handles downgrade scenario', async () => {
    render(<UpdateFirmwarePerApModelIndividual {...props} isUpgrade={false} />)
    const dropdownList = screen.getByRole('combobox')
    await userEvent.click(dropdownList)

    // The option should not be displayed when it is not in the latest 4 versions
    expect(screen.queryByText(props.versionOptions[4].label)).not.toBeInTheDocument()

    // The search function should work when the users try to find the option which is not in the latest 4 versions
    await userEvent.type(dropdownList, props.versionOptions[4].key)
    const excludedOption = screen.getByText(props.versionOptions[4].label)
    expect(excludedOption).toBeInTheDocument()

    // Should put back the option which is not in the latest 4 versions to the dropdown list when it is selected
    await userEvent.click(excludedOption)
    await userEvent.click(dropdownList)
    expect(screen.getAllByText(props.versionOptions[4].label).length).toBeGreaterThan(0)
  })

  it('handles early access version in update now dialog scenario', async () => {
    render(<UpdateFirmwarePerApModelIndividual {...earlyAccessProps} isUpgrade={false} />)

    expect(screen.getByText(/\(7\.1\.1\.520\.214 early access\)/i)).toBeInTheDocument()
  })
})
