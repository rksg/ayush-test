import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { IntlProvider }   from 'react-intl'

import { useIsSplitOn } from '@acx-ui/feature-toggle'


import { ApRadioTypeDataKeyMap, ApRadioTypeEnum,
  channelBandwidth24GOptions,
  channelBandwidth5GOptions,
  channelBandwidth6GOptions,
  VenueRadioTypeDataKeyMap
} from './RadioSettingsContents'
import { RadioSettingsForm } from './RadioSettingsForm'


describe.skip('RadioSettingForm component', () => {
  it('should render Venue Radio 2.4G', async () => {
    const radioType = ApRadioTypeEnum.Radio24G
    const radioDataKey = VenueRadioTypeDataKeyMap[radioType]
    const bandwidthOptions = channelBandwidth24GOptions
    render(
      <IntlProvider locale='en'>
        <RadioSettingsForm
          radioType={radioType}
          radioDataKey={radioDataKey}
          channelBandwidthOptions={bandwidthOptions}
        />
      </IntlProvider>)

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    await userEvent.click((await screen.findByTitle('Channel Fly')))

    const scanIntervalInput = await screen.findByLabelText('Run background scan every')
    await userEvent.type(scanIntervalInput, '40')

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('40 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('40 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))
  })

  it('should render Venue Radio 5G', async () => {
    const radioType = ApRadioTypeEnum.Radio5G
    const radioDataKey = VenueRadioTypeDataKeyMap[radioType]
    const bandwidthOptions = channelBandwidth5GOptions
    render(
      <IntlProvider locale='en'>
        <RadioSettingsForm
          radioType={radioType}
          radioDataKey={radioDataKey}
          channelBandwidthOptions={bandwidthOptions}
        />
      </IntlProvider>)

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    await userEvent.click((await screen.findByTitle('Channel Fly')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('80 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('80 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))
  })

  it('should render Venue Radio 6G', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const radioType = ApRadioTypeEnum.Radio6G
    const radioDataKey = VenueRadioTypeDataKeyMap[radioType]
    const bandwidthOptions = channelBandwidth6GOptions
    render(
      <IntlProvider locale='en'>
        <RadioSettingsForm
          radioType={radioType}
          radioDataKey={radioDataKey}
          channelBandwidthOptions={bandwidthOptions}
        />
      </IntlProvider>)

    await screen.findByText('Channel selection method')

    // The channel select component is disabled with Venue Radio 6G settings
    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).toHaveAttribute('disabled')

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('160 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('160 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))

    const bssMinRateSelect = await screen.findByRole('combobox', { name: /BSS Min Rate/i })
    await userEvent.click(bssMinRateSelect)
    await userEvent.click((await screen.findByTitle('HE MCS 1')))

    const mgmtTxRateSelect = await screen.findByRole('combobox', { name: /Mgmt Tx Rate/i })
    await userEvent.click(mgmtTxRateSelect)
    await userEvent.click((await screen.findByTitle('9 Mbps')))
  })

  it('should render AP Radio 24G', async () => {
    const radioType = ApRadioTypeEnum.Radio24G
    const radioDataKey = ApRadioTypeDataKeyMap[radioType]
    const bandwidthOptions = channelBandwidth24GOptions
    render(
      <IntlProvider locale='en'>
        <RadioSettingsForm
          context='ap'
          radioType={radioType}
          radioDataKey={radioDataKey}
          channelBandwidthOptions={bandwidthOptions}
        />
      </IntlProvider>)

    await screen.findByText('Channel selection method')

    const channelSelect = await screen.findByRole('combobox', { name: /Channel selection/i })
    expect(channelSelect).not.toHaveAttribute('disabled')
    await userEvent.click(channelSelect)
    expect(await screen.findByTitle('Manual channel selection')).toBeDefined()
    await userEvent.click((await screen.findByTitle('Manual channel selection')))

    const bandwidthSelect = await screen.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    expect((await screen.findByTitle('40 MHz'))).toBeDefined()
    await userEvent.click((await screen.findByTitle('40 MHz')))

    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findByTitle('Full')))
  })

  it('should render AP Radio 5G with using venue settings', async () => {
    const radioType = ApRadioTypeEnum.Radio5G
    const radioDataKey = ApRadioTypeDataKeyMap[radioType]
    const bandwidthOptions = channelBandwidth5GOptions
    let isUseVenueSettings = true
    const { asFragment } = render(
      <IntlProvider locale='en'>
        <RadioSettingsForm
          context='ap'
          radioType={radioType}
          radioDataKey={radioDataKey}
          channelBandwidthOptions={bandwidthOptions}
          isUseVenueSettings={isUseVenueSettings}
        />
      </IntlProvider>)

    await screen.findByText('Channel selection method')
    // eslint-disable-next-line testing-library/no-node-access
    const comboboxes = asFragment().querySelectorAll('.ant-select-borderless')
    expect(comboboxes).toHaveLength(3)
  })
})
