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
  waitFor,
  within
} from '@acx-ui/test-utils'

import { switchLatestV1002, switchVenueV1002 } from '../../__tests__/fixtures'
import {
  preference,
  upgradeSwitchViewList,
  switchReleaseV1002
} from '../__test__/fixtures'

import { SwitchFirmwareWizardType, SwitchUpgradeWizard } from '.'


const mockedCancel = jest.fn()
const updateRequestSpy = jest.fn()
const getSwitchRequestSpy = jest.fn()

jest.mock('../../../PreferencesDialog', () => ({
  ...jest.requireActual('../../../PreferencesDialog'),
  VenueStatusDrawer: () => {
    return <div data-testid='test-VenueStatusDrawer' />
  }
}))

jest.mock('./VenueStatusDrawer', () => ({
  ...jest.requireActual('./VenueStatusDrawer'),
  PreferencesDialog: () => {
    return <div data-testid='test-PreferencesDialog' />
  }
}))

const { mockSwitchCurrentVersionsV1002 } = SwitchFirmwareFixtures

describe('SwitchFirmware - SwitchUpgradeWizard', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(firmwareApi.util.resetApiState())
    Modal.destroyAll()
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
      rest.post(
        FirmwareRbacUrlsInfo.getSwitchFirmwareList.url,
        (req, res, ctx) => res(ctx.json(upgradeSwitchViewList))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchCurrentVersions.url,
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersionsV1002))
      ),
      rest.post(
        FirmwareRbacUrlsInfo.updateSwitchVenueSchedules.url,
        (req, res, ctx) => {
          updateRequestSpy()
          return res(ctx.json({ requestId: 'requestId' }))
        }
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.get(
        FirmwareRbacUrlsInfo.getSwitchDefaultFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatestV1002))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchFirmwareList.url,
        (req, res, ctx) => {
          getSwitchRequestSpy()
          return res(ctx.json(upgradeSwitchViewList))
        }
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })


  it.skip('render SwitchUpgradeWizard - schedule - cancel', async () => {
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

  it('render SwitchUpgradeWizard - schedule - Save', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.schedule}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenueV1002.filter(
            item => item.venueName === 'My-Venue') as FirmwareSwitchVenueV1002[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = await screen.findByTestId('steps-form-steps')
    expect(stepsFormSteps).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Please select at least 1 item')).toBeInTheDocument()

    const myVenue = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(myVenue).getByRole('checkbox'))
    expect(within(myVenue).getByRole('checkbox')).toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByText(/When do you want the update to run/i)).toBeInTheDocument()
  })

  it.skip('render SwitchUpgradeWizard - update now - Validate required venue', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.update}
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
  })

  it('render SwitchUpgradeWizard - update now - Validate reqired version', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.update}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenueV1002.filter(
            item => item.venueName === 'My-Venue') as FirmwareSwitchVenueV1002[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = await screen.findByTestId('steps-form-steps')
    expect(stepsFormSteps).toBeInTheDocument()

    const myVenue = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(myVenue).getByRole('checkbox'))
    expect(within(myVenue).getByRole('checkbox')).toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/Please note that during the firmware update/i)).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Run Update' }))
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/Please select at least 1 firmware version/i)).toBeInTheDocument()

  })

  it.skip('render SwitchUpgradeWizard - update now - Save', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.update}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenueV1002.filter(
            item => item.venueName === 'My-Venue') as FirmwareSwitchVenueV1002[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const stepsFormSteps = await screen.findByTestId('steps-form-steps')
    expect(stepsFormSteps).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(await screen.findByText('Please select at least 1 item')).toBeInTheDocument()

    const myVenue = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(myVenue).getByRole('checkbox'))
    expect(within(myVenue).getByRole('checkbox')).toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
    expect(
      await screen.findByText(/Please note that during the firmware update/i)).toBeInTheDocument()

    expect(
      await screen.findByRole('heading', {
        name: /firmware available for icx 7150 series \(1 switches\)/i
      })).toBeInTheDocument()

    const radio71 = await screen.findByRole('radio', {
      name: /9\.0\.10f_b71/i
    })
    expect(radio71).toBeInTheDocument()
    userEvent.click(radio71)
    expect(radio71).toBeEnabled()

    const radio82 = screen.getByRole('radio', {
      name: /10\.0\.10_rc82/i
    })
    userEvent.click(radio82)
    expect(radio82).toBeEnabled()

    const radio7x = screen.getByRole('radio', {
      name: /10\.0\.10_rc55/i
    })
    userEvent.click(radio7x)
    expect(radio7x).toBeEnabled()

    await userEvent.click(screen.getByRole('button', { name: 'Run Update' }))
    await waitFor(()=>{
      expect(updateRequestSpy).toBeCalledTimes(1)
    })

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


  it('render SwitchUpgradeWizard - skip - select switch', async () => {
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

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/skip updates/i)).toBeInTheDocument()

    // Clicks Expand button
    const table = within(dialog).getByRole('table')
    const venue = await within(table).findByRole('row', { name: /My-Venue/i })
    await userEvent.click(within(venue).getByTestId('arrow-right'))
    expect(await within(table).findByTestId('arrow-expand')).toBeInTheDocument()

    const searchBox = within(dialog).getByRole('textbox')
    expect(searchBox).toBeInTheDocument()
    await userEvent.type(searchBox, 'mock')
    expect(await within(dialog).findByTestId('switch-search-table')).toBeInTheDocument()

    const FEK3224R0AG = await within(dialog).findByRole('row', { name: /FEK3224R0AG/i })
    const FEK3224R0AGCheckbox = within(FEK3224R0AG).getByRole('checkbox')
    await userEvent.click(FEK3224R0AGCheckbox)
    expect(FEK3224R0AGCheckbox).toBeChecked()

    const skipButton = within(dialog).getByRole('button', { name: 'Skip' })
    await userEvent.click(skipButton)
    expect(await screen.findByText('Skip This Update?')).toBeInTheDocument()
  })
})
