import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }    from '@acx-ui/feature-toggle'
import { firmwareApi }     from '@acx-ui/rc/services'
import {
  FirmwareRbacUrlsInfo,
  FirmwareSwitchVenueV1002,
  FirmwareUrlsInfo,
  SwitchFirmwareFixtures
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import { switchLatestV1002, switchVenueV1002 } from '../../../__tests__/fixtures'
import {
  preference,
  upgradeSwitchViewList,
  switchReleaseV1002
} from '../../__test__/fixtures'

import { SwitchFirmwareWizardType, SwitchUpgradeWizard } from './../'

const mockedCancel = jest.fn()
const switchFwRequestSpy = jest.fn()

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

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetSwitchCurrentVersionsV1001Query: () => ({
    data: mockSwitchCurrentVersionsV1002
  })
}))
const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

describe('SwitchFirmware - SwitchUpgradeWizard', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    Modal.destroyAll()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(firmwareApi.util.resetApiState())
    mockServer.use(
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchVenueVersionList.url,
        (req, res, ctx) => res(ctx.json(switchVenueV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchAvailableFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchReleaseV1002))
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
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      ),
      rest.post(
        FirmwareUrlsInfo.updateSwitchVenueSchedules.url,
        (req, res, ctx) => res(ctx.json({ requestId: 'requestId' }))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchFirmwareList.url,
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

  it.skip('render SwitchUpgradeWizard - schedule', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.schedule}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenueV1002 as FirmwareSwitchVenueV1002[]} />
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
          data={switchVenueV1002.filter(
            item => item.venueName === 'My-Venue') as FirmwareSwitchVenueV1002[]} />
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

  it('render SwitchUpgradeWizard - select switch step - venue - select one', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.skip}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenueV1002.filter(
            item => item.venueName === 'My-Venue') as FirmwareSwitchVenueV1002[]} />
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
  })

  it.skip('render SwitchUpgradeWizard - select switch step - venue - select all', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.skip}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenueV1002 as FirmwareSwitchVenueV1002[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = screen.getByText(/skip updates/i)
    expect(stepsFormSteps).toBeInTheDocument()

    //select all
    const selectAll = screen.getByRole('row', {
      name: /venue model current firmware available firmware scheduling/i
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
          data={switchVenueV1002.filter(
            item => item.venueName === 'My-Venue') as FirmwareSwitchVenueV1002[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = screen.getByText(/skip updates/i)
    expect(stepsFormSteps).toBeInTheDocument()

    // Clicks Expand button
    const venue = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(venue).getByTestId('arrow-right'))

    expect(await screen.findByTestId('arrow-expand')).toBeInTheDocument()
  })

  it('render SwitchUpgradeWizard - search switch', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.skip}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenueV1002 as FirmwareSwitchVenueV1002[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const dialog = screen.getByRole('dialog')

    const stepsFormSteps = within(dialog).getByText(/skip updates/i)
    expect(stepsFormSteps).toBeInTheDocument()

    const searchBox = within(dialog).getByRole('textbox')
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
  })

})
