import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import {
  FirmwareSwitchVenue,
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  switchVenue,
  preference,
  switchRelease,
  switchCurrentVersions,
  switchLatest,
  upgradeSwitchViewList
} from '../../__test__/fixtures'

import { SwitchFirmwareWizardType, SwitchUpgradeWizard } from './../'

jest.mock('../../../../PreferencesDialog', () => ({
  ...jest.requireActual('../../../../PreferencesDialog'),
  VenueStatusDrawer: () => {
    return <div data-testid='test-VenueStatusDrawer' />
  }
}))

jest.mock('./../VenueStatusDrawer', () => ({
  ...jest.requireActual('./../VenueStatusDrawer'),
  PreferencesDialog: () => {
    return <div data-testid='test-PreferencesDialog' />
  }
}))

const mockedCancel = jest.fn()
const switchFwRequestSpy = jest.fn()

describe('SwitchFirmware - SwitchUpgradeWizard', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    Modal.destroyAll()
    mockServer.use(
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenue))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchRelease))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchUpgradePreferences.url,
        (req, res, ctx) => res(ctx.json(preference))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchFirmwarePredownload.url,
        (req, res, ctx) => res(ctx.json({
          preDownload: false
        }))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(switchCurrentVersions))
      ),
      rest.post(
        FirmwareUrlsInfo.updateSwitchVenueSchedules.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'requestId' }))
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatest))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchFirmwareList.url,
        (req, res, ctx) => {
          switchFwRequestSpy()
          return res(ctx.json(upgradeSwitchViewList))
        }
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })


  it('render SwitchUpgradeWizard - schedule', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.schedule}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList as FirmwareSwitchVenue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = await screen.findByTestId('steps-form-steps')
    expect(stepsFormSteps).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Please select at least 1 item')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(mockedCancel).toBeCalledTimes(1)
  })

  it('render SwitchUpgradeWizard - skip', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.skip}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList as FirmwareSwitchVenue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = screen.getByText(/skip updates/i)
    expect(stepsFormSteps).toBeInTheDocument()

    const skipButton = await screen.findByRole('button', { name: 'Skip' })
    await userEvent.click(skipButton)
    expect(await screen.findByText('Please select at least 1 item')).toBeInTheDocument()

    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(row).getByRole('checkbox'))
    await userEvent.click(skipButton)
    expect(await screen.findByText('Skip This Update?')).toBeInTheDocument()
  })

  it('render SwitchUpgradeWizard - select switch step - venue', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.skip}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList as FirmwareSwitchVenue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = screen.getByText(/skip updates/i)
    expect(stepsFormSteps).toBeInTheDocument()
    //select 1 item
    const myVenue = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(myVenue).getByRole('checkbox'))
    expect(within(myVenue).getByRole('checkbox')).toBeChecked()

    //deselect 1 item
    await userEvent.click(within(myVenue).getByRole('checkbox'))
    expect(within(myVenue).getByRole('checkbox')).not.toBeChecked()

    //select all
    const selectAll = screen.getByRole('row', {
      name: /venue current firmware available firmware scheduling/i
    })
    await userEvent.click(within(selectAll).getByRole('checkbox'))
    expect(within(selectAll).getByRole('checkbox')).toBeChecked()

    //deselect all
    await userEvent.click(within(selectAll).getByRole('checkbox'))
    expect(within(selectAll).getByRole('checkbox')).not.toBeChecked()
  })


  it('render SwitchUpgradeWizard - select switch step - switch', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.skip}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList as FirmwareSwitchVenue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = screen.getByText(/skip updates/i)
    expect(stepsFormSteps).toBeInTheDocument()

    // Clicks Expand button
    const venue = await screen.findByRole('row', { name: /Karen-Venue1/i })
    await userEvent.click(within(venue).getByRole('button', {
      name: /expand row/i }))

    expect(await screen.findByRole('button', {
      name: /collapse row/i
    })).toBeInTheDocument()
  })

  it('render SwitchUpgradeWizard - search switch', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.skip}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList as FirmwareSwitchVenue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((checkbox) => {
      if ((checkbox as HTMLInputElement).checked) {
        userEvent.click(checkbox)
      }
    })

    const stepsFormSteps = screen.getByText(/skip updates/i)
    expect(stepsFormSteps).toBeInTheDocument()

    const searchBox = screen.getByRole('textbox')
    expect(searchBox).toBeInTheDocument()
    await userEvent.type(searchBox, 'mock')
    expect(screen.getByDisplayValue(/mock/i)).toBeInTheDocument()
    expect(await screen.findByTestId('switch-search-table')).toBeInTheDocument()

    const mockSwitchRow = await screen.findByRole('row', { name: /mock switch/i })
    const mockSwitchCheckbox = within(mockSwitchRow).getByRole('checkbox')
    await userEvent.click(mockSwitchCheckbox)
    expect(mockSwitchCheckbox).toBeChecked()

    const FEK3224R0AG = await screen.findByRole('row', { name: /FEK3224R0AG/i })
    const FEK3224R0AGCheckbox = within(FEK3224R0AG).getByRole('checkbox')
    await userEvent.click(FEK3224R0AGCheckbox)
    expect(FEK3224R0AGCheckbox).toBeChecked()

    const selectAllRow = screen.getByRole('row', {
      name: /switch model current firmware available firmware scheduling/i
    })
    const selectAllCheckbox = within(selectAllRow).getByRole('checkbox')
    expect(selectAllCheckbox).toBeInTheDocument()
    await userEvent.click(selectAllCheckbox)

    //Flaky test
    await waitFor(() => {
      expect(selectAllCheckbox).not.toBeChecked()
    })

    await userEvent.click(selectAllCheckbox)
    expect(selectAllCheckbox).toBeChecked()
    expect(FEK3224R0AGCheckbox).toBeChecked()

    await userEvent.click(FEK3224R0AGCheckbox)
    expect(FEK3224R0AGCheckbox).not.toBeChecked()
  })

})
