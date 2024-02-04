import userEvent from '@testing-library/user-event'
import { Modal } from 'antd'
import { rest }  from 'msw'

import { firmwareApi }     from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
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

import {
  switchVenue,
  preference,
  switchRelease,
  switchLatest,
  upgradeSwitchViewList
} from '../__test__/fixtures'

import { SwitchFirmwareWizardType, SwitchUpgradeWizard } from '.'

const { mockSwitchCurrentVersions } = SwitchFirmwareFixtures

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

describe('SwitchFirmware - SwitchUpgradeWizard', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    store.dispatch(firmwareApi.util.resetApiState())
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
        (req, res, ctx) => res(ctx.json(mockSwitchCurrentVersions))
      ),
      rest.post(
        FirmwareUrlsInfo.updateSwitchVenueSchedules.url,
        (req, res, ctx) => {
          updateRequestSpy()
          return res(ctx.json({ requestId: 'requestId' }))
        }
      ),
      rest.get(
        FirmwareUrlsInfo.getSwitchLatestFirmwareList.url,
        (req, res, ctx) => res(ctx.json(switchLatest))
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


  it('render SwitchUpgradeWizard - schedule - cancel', async () => {
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

  it('render SwitchUpgradeWizard - schedule - Save', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.schedule}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList.filter(
            item => item.name === 'My-Venue') as FirmwareSwitchVenue[]} />
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

  it('render SwitchUpgradeWizard - update now - Validate required venue', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.update}
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
  })

  it('render SwitchUpgradeWizard - update now - Validate reqired version', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.update}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList.filter(
            item => item.name === 'My-Venue') as FirmwareSwitchVenue[]} />
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

  it('render SwitchUpgradeWizard - update now - Save', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.update}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList.filter(
            item => item.name === 'My-Venue') as FirmwareSwitchVenue[]} />
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

    const radio09010f = screen.getByRole('radio', {
      name: /9\.0\.10f_b403 \(release\)/i
    })
    expect(radio09010f).toBeInTheDocument()
    userEvent.click(radio09010f)
    expect(radio09010f).toBeEnabled()

    const radio10010b176 = screen.getByRole('radio', {
      name: /10\.0\.10_b176 \(release\)/i
    })
    userEvent.click(radio10010b176)
    expect(radio10010b176).toBeEnabled()
    //FIXME:
    // eslint-disable-next-line testing-library/no-unnecessary-act
    // act(()=>{ // workaround - avoid act error
    //   fireEvent.click(screen.getByRole('button', { name: 'Run Update' }))
    // })
    // await userEvent.click(screen.getByRole('button', { name: 'Run Update' }))
    // await waitFor(()=>{
    //   expect(updateRequestSpy).toBeCalledTimes(1)
    // })

  })

  it('render SwitchUpgradeWizard - skip', async () => {
    render(
      <Provider>
        <SwitchUpgradeWizard
          wizardType={SwitchFirmwareWizardType.skip}
          visible={true}
          setVisible={mockedCancel}
          onSubmit={() => { }}
          data={switchVenue.upgradeVenueViewList.filter(
            item => item.name === 'My-Venue') as FirmwareSwitchVenue[]} />
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
          data={switchVenue.upgradeVenueViewList.filter(
            item => item.name === 'Karen-Venue1') as FirmwareSwitchVenue[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/skip updates/i)).toBeInTheDocument()

    // Clicks Expand button
    const table = within(dialog).getByRole('table')
    const venue = await within(table).findByRole('row', { name: /Karen-Venue1/i })
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
