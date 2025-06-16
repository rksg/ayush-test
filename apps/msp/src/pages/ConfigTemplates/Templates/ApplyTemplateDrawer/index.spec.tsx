import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { MspEc, MspUrlsInfo }                          from '@acx-ui/msp/utils'
import { ConfigTemplateType }                          from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import HspContext                                                                     from '../../../../HspContext'
import { mockedConfigTemplateList, mockedMSPCustomerList }                            from '../../__tests__/fixtures'
import { AppliedMspEcListView, ApplyTemplateConfirmationDrawer, ApplyTemplateDrawer } from '../ApplyTemplateDrawer'

jest.mock('../CustomerFirmwareReminder', () => ({
  ...jest.requireActual('../CustomerFirmwareReminder'),
  CustomerFirmwareReminder: () => <div>CustomerFirmwareReminder</div>
}))

jest.mock('@acx-ui/main/components', () => ({
  ...jest.requireActual('@acx-ui/main/components'),
  ConfigTemplateOverrideModal: () => <div>ConfigTemplateOverrideModal</div>,
  MAX_APPLICABLE_EC_TENANTS: 2
}))

const mockedApplyConfigTemplateFn = jest.fn().mockResolvedValue({})
jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useApplyConfigTemplateMutation: () => [ () => ({ unwrap: mockedApplyConfigTemplateFn }) ]
}))

describe('ApplyTemplateDrawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedMSPCustomerList }))
      )
    )

    mockedApplyConfigTemplateFn.mockClear()
  })

  it('should render the specific column when it is Hospitality Edition', async () => {
    render(
      <HspContext.Provider value={{ state: { isHsp: true }, dispatch: jest.fn() }}>
        <Provider>
          <ApplyTemplateDrawer
            setVisible={jest.fn()}
            selectedTemplate={mockedConfigTemplateList.data[0]}
          />
        </Provider>
      </HspContext.Provider>
    )

    expect(await screen.findByRole('columnheader', { name: 'Account Type' })).toBeInTheDocument()
  })

  it('should render the specific column when the template type can be overriden', async () => {
    render(
      <HspContext.Provider value={{ state: { isHsp: false }, dispatch: jest.fn() }}>
        <Provider>
          <ApplyTemplateDrawer
            setVisible={jest.fn()}
            // eslint-disable-next-line max-len
            selectedTemplate={mockedConfigTemplateList.data.find(d => d.type === ConfigTemplateType.VENUE)!}
          />
        </Provider>
      </HspContext.Provider>
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('columnheader', { name: 'Template Override Value' })).toBeInTheDocument()
  })

  it('should call setVisible when the close button is clicked', async () => {
    const setVisibleFn = jest.fn()

    render(
      <HspContext.Provider value={{ state: { isHsp: false }, dispatch: jest.fn() }}>
        <Provider>
          <ApplyTemplateDrawer
            setVisible={setVisibleFn}
            selectedTemplate={mockedConfigTemplateList.data[0]}
          />
        </Provider>
      </HspContext.Provider>
    )

    const applyTemplateDrawer = await screen.findByRole('dialog')
    const targetEcRow = await within(applyTemplateDrawer).findByRole('row', { name: /ec-1/i })

    await userEvent.click(within(targetEcRow).getByRole('checkbox'))
    await userEvent.click(await screen.findByRole('button', { name: /Next/ }))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(2))

    const confirmationDrawer = screen.queryAllByRole('dialog')[1]
    await userEvent.click(within(confirmationDrawer).getByRole('button', { name: /Back/ }))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(1))

    await userEvent.click(within(applyTemplateDrawer).getByRole('button', { name: /Cancel/ }))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(1))
    expect(setVisibleFn).toHaveBeenCalledWith(false)
  })

  it('should apply the template when the apply button is clicked', async () => {
    const setVisibleFn = jest.fn()

    render(
      <HspContext.Provider value={{ state: { isHsp: false }, dispatch: jest.fn() }}>
        <Provider>
          <ApplyTemplateDrawer
            setVisible={setVisibleFn}
            selectedTemplate={mockedConfigTemplateList.data[0]}
          />
        </Provider>
      </HspContext.Provider>
    )

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

    await waitFor(() => expect(mockedApplyConfigTemplateFn).toHaveBeenCalledTimes(2))

    await waitFor(() => expect(screen.queryAllByRole('dialog').length).toBe(1))
    expect(setVisibleFn).toHaveBeenCalledWith(false)
  })

  it('should render override modal', async () => {
    const setVisibleFn = jest.fn()

    render(
      <HspContext.Provider value={{ state: { isHsp: false }, dispatch: jest.fn() }}>
        <Provider>
          <ApplyTemplateDrawer
            setVisible={setVisibleFn}
            // eslint-disable-next-line max-len
            selectedTemplate={mockedConfigTemplateList.data.find(t => t.type === ConfigTemplateType.VENUE)!}
          />
        </Provider>
      </HspContext.Provider>
    )

    const applyTemplateDrawer = await screen.findByRole('dialog')

    // Verify if the override column is shown
    expect(
      await within(applyTemplateDrawer).findByRole('columnheader',
        { name: /Template Override Value/i })
    ).toBeVisible()

    await userEvent.click(await within(applyTemplateDrawer).findByRole('row', { name: /ec-1/i }))
    // eslint-disable-next-line max-len
    await userEvent.click(await within(applyTemplateDrawer).findByRole('button', { name: /Override Template/ }))

    expect(screen.getByText('ConfigTemplateOverrideModal')).toBeVisible()
  })

  describe('AppliedMspEcListView', () => {
    it('renders override display when both component and data exist', () => {
      const targetEc = mockedMSPCustomerList.data[0] as MspEc
      const overrideValues = {
        [targetEc.id]: { name: 'override1' }
      }

      render(
        <AppliedMspEcListView
          targetMspEcs={[targetEc]}
          templateType={ConfigTemplateType.VENUE}
          overrideValues={overrideValues}
        />
      )

      expect(screen.getByText(targetEc.name)).toBeInTheDocument()
      expect(screen.getByText('Name: override1')).toBeInTheDocument()
    })
  })

  describe('ApplyTemplateConfirmationDrawer', () => {
    it('should render the customer firmware reminder', async () => {
      // eslint-disable-next-line max-len
      const venueTemplate = mockedConfigTemplateList.data.find(d => d.type === ConfigTemplateType.VENUE)!
      render(
        <ApplyTemplateConfirmationDrawer
          targetMspEcs={[]}
          selectedTemplate={venueTemplate}
          overrideValues={undefined}
          onBack={jest.fn()}
          onApply={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      expect(await screen.findByText('CustomerFirmwareReminder')).toBeInTheDocument()
    })
  })
})
