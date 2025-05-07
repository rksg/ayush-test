import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { MspUrlsInfo }                                            from '@acx-ui/msp/utils'
import {
  AdministrationUrlsInfo, CONFIG_TEMPLATE_PATH_PREFIX, ConfigTemplateContext,
  ConfigTemplateType, ConfigTemplateUrlsInfo, PoliciesConfigTemplateUrlsInfo,
  VenueConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                               from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { ConfigTemplateTabKey }                                                                        from '..'
import { mockVenueTemplateList, mockedConfigTemplateList, mockedMSPCustomerList, mockedVenueTemplate } from '../__tests__/fixtures'

import { ShowDriftsDrawerProps } from './ShowDriftsDrawer'

import { ConfigTemplateList } from '.'

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  MAX_APPLICABLE_EC_TENANTS: 2
}))

const mockedUsedNavigate = jest.fn()
const mockedLocation = '/test'
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useLocation: () => mockedLocation
}))

jest.mock('./ShowDriftsDrawer', () => ({
  ...jest.requireActual('./ShowDriftsDrawer'),
  ShowDriftsDrawer: (props: ShowDriftsDrawerProps) => {
    return <div data-testid='ShowDriftsDrawer'>
      <span>{props.selectedTemplate.name}</span>
      <button onClick={() => props.setVisible(false)}>Cancel</button>
    </div>
  }
}))

jest.mock('./DetailsDrawer', () => ({
  ...jest.requireActual('./DetailsDrawer'),
  ProtectedDetailsDrawer: () => <div>DetailsDrawer</div>
}))

jest.mock('./CloneModal', () => ({
  ...jest.requireActual('./CloneModal'),
  ConfigTemplateCloneModal: () => <div>ConfigTemplateCloneModal</div>
}))

describe('ConfigTemplateList component', () => {
  const path = `/:tenantId/v/${CONFIG_TEMPLATE_PATH_PREFIX}/:activeTab`
  const params = { tenantId: '__TENANT_ID', activeTab: ConfigTemplateTabKey.TEMPLATES }

  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.CONFIG_TEMPLATE)

    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.getConfigTemplates.url,
        (req, res, ctx) => res(ctx.json({ ...mockedConfigTemplateList }))
      ),
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedMSPCustomerList }))
      )
    )
  })
  it('should render table with data', async () => {
    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByRole('button', { name: /Add Template/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /Template 1/i })).toBeVisible()

    // Check type filter is visible or not
    const typeFilter = screen.getByRole('combobox')
    await userEvent.click(typeFilter)
    expect(screen.getByText(ConfigTemplateType.DPSK)).toBeInTheDocument()
  })

  it('should render appliedToTenant Drawer with data', async () => {
    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    expect(await screen.findByRole('button', { name: /Add Template/i })).toBeVisible()
    const row = await screen.findByRole('row', { name: /Template 1/i })
    expect(row).toBeVisible()
    const appliedToButton = await within(row).findByRole('button', {
      name: /2/i
    })
    await userEvent.click(appliedToButton)
    expect(await screen.findByText(/applied to ec tenants/i)).toBeVisible()
    await userEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText(/applied to ec tenants/i)).toBeNull()
  })

  it('should apply template', async () => {
    const applyFn = jest.fn()

    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.applyConfigTemplate.url,
        (req, res, ctx) => {
          applyFn()
          return res(ctx.json({ requestId: '123456789ABCDEFG' }))
        }
      )
    )

    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetRow = await screen.findByRole('row', { name: /Template 1/i })

    await userEvent.click(within(targetRow).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Apply Template/ }))

    const applyTemplateDrawer = await screen.findByRole('dialog')

    const targetEcRow = await within(applyTemplateDrawer).findByRole('row', { name: /ec-1/i })
    await userEvent.click(within(targetEcRow).getByRole('checkbox'))

    // Check if the limitation of disallowing re-apply to the same customers is working
    const reApplyRow = await within(applyTemplateDrawer).findByRole('row', { name: /Chill-Tel/i })
    expect(within(reApplyRow).getByRole('checkbox')).toBeDisabled()


    // Check if the maximum limitation is working
    const targetEcRow2 = await within(applyTemplateDrawer).findByRole('row', { name: /Tal-Tel/i })
    await userEvent.click(within(targetEcRow2).getByRole('checkbox'))
    const targetEcRow3 = await within(applyTemplateDrawer).findByRole('row', { name: /Camel-Tel/i })
    expect(within(targetEcRow3).getByRole('checkbox')).toBeDisabled()

    await userEvent.click(await within(applyTemplateDrawer).findByRole('button', { name: /Next/ }))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(2))

    const confirmationDrawer = screen.queryAllByRole('dialog')[1]
    expect(await within(confirmationDrawer).findByText('- Template 1')).toBeVisible()
    // eslint-disable-next-line max-len
    await userEvent.click(within(confirmationDrawer).getByRole('button', { name: /Apply Template/ }))

    await waitFor(() => expect(applyFn).toHaveBeenCalledTimes(2))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(0))
  })

  it('should override the Venue config template', async () => {
    const applyFn = jest.fn()

    mockServer.use(
      rest.post(
        ConfigTemplateUrlsInfo.applyConfigTemplate.url,
        (req, res, ctx) => {
          applyFn(req.body)
          return res(ctx.json({ requestId: '123456789ABCDEFG' }))
        }
      ),
      rest.get(
        VenueConfigTemplateUrlsInfo.getVenueTemplate.url,
        (req, res, ctx) => res(ctx.json(mockedVenueTemplate))
      ),
      rest.post(
        ConfigTemplateUrlsInfo.getVenuesTemplateList.url,
        (_, res, ctx) => res(ctx.json(mockVenueTemplateList))
      ),
      rest.get(
        AdministrationUrlsInfo.getPreferences.url,
        (_req, res, ctx) => res(ctx.json({ global: { mapRegion: 'TW' } }))
      )
    )

    render(
      <Provider>
        <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <ConfigTemplateList />
        </ConfigTemplateContext.Provider>
      </Provider>, {
        route: { params, path }
      }
    )

    await userEvent.click(await screen.findByRole('row', { name: /Template 1/i })) // Network type config template
    await userEvent.click(await screen.findByRole('button', { name: /Apply Template/ }))

    const applyTemplateDrawerForNetworkType = await screen.findByRole('dialog')

    // eslint-disable-next-line max-len
    await userEvent.click(await within(applyTemplateDrawerForNetworkType).findByRole('row', { name: /ec-1/i }))

    // Only Venue template can be overridden
    expect(
      within(applyTemplateDrawerForNetworkType).queryByRole('button', { name: /Override Template/ })
    ).toBeNull()

    // eslint-disable-next-line max-len
    await userEvent.click(await within(applyTemplateDrawerForNetworkType).findByRole('button', { name: /Cancel/ }))

    await userEvent.click(await screen.findByRole('row', { name: /Venue Template/i }))
    await userEvent.click(await screen.findByRole('button', { name: /Apply Template/ }))

    const applyTemplateDrawerForVenueType = await screen.findByRole('dialog')

    // Verify if the override column is shown
    expect(
      await within(applyTemplateDrawerForVenueType).findByRole('columnheader',
        { name: /Template Override Value/i })
    ).toBeVisible()

    // eslint-disable-next-line max-len
    await userEvent.click(await within(applyTemplateDrawerForVenueType).findByRole('row', { name: /ec-1/i }))
    // eslint-disable-next-line max-len
    await userEvent.click(await within(applyTemplateDrawerForVenueType).findByRole('button', { name: /Override Template/ }))

    // eslint-disable-next-line max-len
    const venueOverrideDialog = await screen.findByRole('dialog', { name: /Override Venue Template/ })
    // eslint-disable-next-line max-len
    const venueNameInput = await within(venueOverrideDialog).findByDisplayValue(mockedVenueTemplate.name)

    await userEvent.clear(venueNameInput)
    await userEvent.type(venueNameInput, 'Overridden Venue Name')
    await userEvent.click(within(venueOverrideDialog).getByRole('button', { name: /Add/ }))

    // Verify if the overrides values is shown in the column
    expect(
      await within(applyTemplateDrawerForVenueType).findByRole('cell',
        { name: /Overridden Venue Name/ })
    ).toBeVisible()

    // eslint-disable-next-line max-len
    await userEvent.click(within(applyTemplateDrawerForVenueType).getByRole('button', { name: /Next/ }))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(2))

    const confirmationDrawer = screen.queryAllByRole('dialog')[1]
    // eslint-disable-next-line max-len
    await userEvent.click(within(confirmationDrawer).getByRole('button', { name: /Apply Template/ }))

    await waitFor(() => expect(applyFn).toHaveBeenCalledTimes(1))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(0))
  })

  it('should cancel Apply Template dialog', async () => {
    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    const targetRow = await screen.findByRole('row', { name: /Template 1/i })

    await userEvent.click(within(targetRow).getByRole('radio'))
    await userEvent.click(await screen.findByRole('button', { name: /Apply Template/ }))

    const applyTemplateDrawer = await screen.findByRole('dialog')
    const targetEcRow = await within(applyTemplateDrawer).findByRole('row', { name: /ec-1/i })

    await userEvent.click(within(targetEcRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Next/ }))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(2))

    const confirmationDrawer = screen.queryAllByRole('dialog')[1]
    await userEvent.click(within(confirmationDrawer).getByRole('button', { name: /Back/ }))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(1))

    await userEvent.click(within(applyTemplateDrawer).getByRole('button', { name: /Cancel/ }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should delete selected template', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        ConfigTemplateUrlsInfo.deleteNetworkTemplate.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    const targetTemplate = mockedConfigTemplateList.data.find(t => t.type === ConfigTemplateType.NETWORK)!
    const row = await screen.findByRole('row', { name: new RegExp(targetTemplate.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + targetTemplate.name + '"?')).toBeVisible()
    const deleteButton = await screen.findByRole('button', { name: /Delete Config Template/i })
    await userEvent.click(deleteButton)

    await waitFor(() => expect(deleteFn).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should navigate to the edit page', async () => {
    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    const targetTemplate = mockedConfigTemplateList.data.find(t => t.type === ConfigTemplateType.NETWORK)!
    const row = await screen.findByRole('row', { name: new RegExp(targetTemplate.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    expect(mockedUsedNavigate).toHaveBeenCalledWith(
      `/__TENANT_ID/v/configTemplates/networks/wireless/${targetTemplate.id}/edit`,
      expect.objectContaining({ state: { from: mockedLocation } })
    )
  })

  it('should open the Access Control Sub Policy drawer', async () => {
    const mockedL2AclTemplate = {
      id: 'cc39f9a5097b4004839cf9d5a4d5dd98',
      name: 'L2-Template',
      access: 'ALLOW',
      macAddresses: ['AA:BB:CC:DD:EE:11']
    }
    mockServer.use(
      rest.get(
        PoliciesConfigTemplateUrlsInfo.getL2AclPolicy.url,
        (req, res, ctx) => res(ctx.json({ ...mockedL2AclTemplate }))
      ),
      rest.post(
        PoliciesConfigTemplateUrlsInfo.getEnhancedL2AclPolicies.url,
        (req, res, ctx) => res(ctx.json({
          fields: ['name', 'id'],
          totalCount: 1,
          page: 1,
          data: [{ ...mockedL2AclTemplate }]
        })))
    )

    render(
      <Provider>
        <ConfigTemplateContext.Provider value={{ isTemplate: true }}>
          <ConfigTemplateList />
        </ConfigTemplateContext.Provider>
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    const targetTemplate = mockedConfigTemplateList.data.find(t => t.type === ConfigTemplateType.LAYER_2_POLICY)!
    const targetRow = await screen.findByRole('row', { name: new RegExp(targetTemplate.name) })
    await userEvent.click(within(targetRow).getByRole('radio'))
    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editDrawer = await screen.findByRole('dialog')
    // eslint-disable-next-line max-len
    expect(await within(editDrawer).findByDisplayValue(mockedL2AclTemplate.name)).toBeInTheDocument()
    await userEvent.click(within(editDrawer).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('should show drift', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE_DRIFTS)

    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetTemplate = mockedConfigTemplateList.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(targetTemplate.name) })
    await userEvent.click(within(row).getByRole('radio'))

    // Display Show Drifts by clicking the row action
    await userEvent.click(await screen.findByRole('button', { name: /Show Drifts/ }))
    const showDriftsDrawer = await screen.findByTestId('ShowDriftsDrawer')

    await userEvent.click(within(showDriftsDrawer).getByRole('button', { name: /Cancel/i }))
    expect(screen.queryByTestId('ShowDriftsDrawer')).not.toBeInTheDocument()

    // Display Show Drifts by clicking the in-row link
    await userEvent.click(within(row).getByRole('button', { name: /Drift Detected/ }))
    expect(await screen.findByTestId('ShowDriftsDrawer')).toBeInTheDocument()
  })

  it('should show details drawer', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE_NAME_DRAWER)

    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetTemplate = mockedConfigTemplateList.data[0]
    await userEvent.click(screen.getByRole('button', { name: targetTemplate.name }))

    expect(await screen.findByText('DetailsDrawer')).toBeInTheDocument()
  })

  it('should execute clone action', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CONFIG_TEMPLATE_CLONE)

    render(
      <Provider>
        <ConfigTemplateList />
      </Provider>, {
        route: { params, path }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    const targetTemplate = mockedConfigTemplateList.data.find(t => t.type === ConfigTemplateType.NETWORK)!
    const row = await screen.findByRole('row', { name: new RegExp(targetTemplate.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(await screen.findByRole('button', { name: /Clone/ }))
    expect(await screen.findByText('ConfigTemplateCloneModal')).toBeInTheDocument()
  })
})
