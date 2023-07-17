/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import moment    from 'moment-timezone'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen,
  fireEvent
} from '@acx-ui/test-utils'

import { SubscriptionUsageReportDialog } from '.'


const customerData = {
  data:
    [
      {
        name: 'Din Tai Fung',
        id: '2242a683a7594d7896385cfef1fe4442'
      },
      {
        name: 'Eva Airways',
        id: '350f3089a8e34509a2913c550faffa7e'
      }
    ]
}
const months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const deviceDetails = false
const page = 1
const dailyReportsPerPage = '31'
const url = 'usage-report'

const services = require('@acx-ui/msp/services')
jest.mock('@acx-ui/msp/services', () => ({
  ...jest.requireActual('@acx-ui/msp/services')
}))
const utils = require('@acx-ui/rc/utils')
jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils')
}))

const mockedCloseDialog = jest.fn()

describe('SubscriptionUsageReportDialog', () => {
  let params: { tenantId: string }

  beforeEach(async () => {
    utils.useTableQuery = jest.fn().mockImplementation(() => {
      return { data: customerData }
    })
    params = { tenantId: '3061bd56e37445a8993ac834c01e2710' }
  })

  it('should render correctly', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    expect(screen.getByRole('dialog')).toBeVisible()
    expect(screen.getByText('Generate Usage Report')).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Period' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Format' })).toBeVisible()
    expect(screen.getByRole('heading', { level: 4, name: 'Select Customers' })).toBeVisible()
    expect(screen.getAllByRole('radio')).toHaveLength(9)
    expect(screen.getAllByRole('combobox')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Generate' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled()
  })
  it('should set default values correctly', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    expect(screen.getByRole('radio', { name: 'Calendar Month' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 24 Hours' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 7 Days' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 30 Days' })).not.toBeChecked()

    expect(screen.getByRole('radio', { name: 'CSV' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'JSON' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'PDF' })).not.toBeChecked()

    expect(screen.getByRole('radio', { name: 'All Customers' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Specific Customer' })).not.toBeChecked()

    const today = new Date()
    expect(screen.getByText(months.at(today.getMonth()) + ' ' + today.getFullYear().toString())).toBeVisible()
  })
  it('should only show period dropdown if calendar month radio is checked', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    expect(screen.getByRole('radio', { name: 'Calendar Month' })).toBeChecked()
    expect(screen.getAllByRole('combobox')).toHaveLength(1)
    await userEvent.click(screen.getByRole('radio', { name: 'Last 24 Hours' }))
    expect(screen.queryByRole('combobox')).toBeNull()
    await userEvent.click(screen.getByRole('radio', { name: 'Last 7 Days' }))
    expect(screen.queryByRole('combobox')).toBeNull()
    await userEvent.click(screen.getByRole('radio', { name: 'Last 30 Days' }))
    expect(screen.queryByRole('combobox')).toBeNull()
  })
  it('should only show specific customer dropdown if specific customer radio is checked', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    expect(screen.getByRole('radio', { name: 'Specific Customer' })).not.toBeChecked()
    expect(screen.getAllByRole('combobox')).toHaveLength(1)
    await userEvent.click(screen.getByRole('radio', { name: 'Specific Customer' }))
    expect(screen.getAllByRole('combobox')).toHaveLength(2)
  })
  it('generate button disabled if specific customer radio checked but no customer selected', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    expect(screen.getByRole('button', { name: 'Generate' })).toBeEnabled()
    await userEvent.click(screen.getByRole('radio', { name: 'Specific Customer' }))
    expect(screen.getByText('Select a customer')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled()
  })
  it('when calendar month radio checked, query called with correct url payload', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    // Select previous month option in dropdown
    const today = new Date()
    fireEvent.mouseDown(screen.getByRole('combobox'))
    await userEvent.click(screen.getByText(months.at(today.getMonth() - 1) + ' ' + today.getFullYear().toString()))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const payload = `${url}?month=${today.getMonth()}&year=${today.getFullYear()}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
    expect(services.useGetGenerateLicenseUsageRptQuery).toHaveBeenLastCalledWith({ params, payload, selectedFormat: 'csv' }, { skip: false })
  })
  it('when last 24 hours radio checked, query called with correct url payload', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    const startDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    const endDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    await userEvent.click(screen.getByRole('radio', { name: 'Last 24 Hours' }))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const payload = `${url}?startDate=${startDate}&endDate=${endDate}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
    expect(services.useGetGenerateLicenseUsageRptQuery).toHaveBeenLastCalledWith({ params, payload, selectedFormat: 'csv' }, { skip: false })
  })
  it('when last 7 days radio checked, query called with correct url payload', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
    const endDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    await userEvent.click(screen.getByRole('radio', { name: 'Last 7 Days' }))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const payload = `${url}?startDate=${startDate}&endDate=${endDate}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
    expect(services.useGetGenerateLicenseUsageRptQuery).toHaveBeenLastCalledWith({ params, payload, selectedFormat: 'csv' }, { skip: false })
  })
  it('when last 30 days radio checked, query called with correct url payload', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    const startDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
    const endDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    await userEvent.click(screen.getByRole('radio', { name: 'Last 30 Days' }))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const payload = `${url}?startDate=${startDate}&endDate=${endDate}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
    expect(services.useGetGenerateLicenseUsageRptQuery).toHaveBeenLastCalledWith({ params, payload, selectedFormat: 'csv' }, { skip: false })
  })
  it('when json format radio checked, query called with correct url payload', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    const today = new Date()
    await userEvent.click(screen.getByRole('radio', { name: 'JSON' }))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const payload = `${url}?month=${today.getMonth() + 1}&year=${today.getFullYear()}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
    expect(services.useGetGenerateLicenseUsageRptQuery).toHaveBeenLastCalledWith({ params, payload, selectedFormat: 'json' }, { skip: false })
  })
  it('when pdf format radio checked, query called with correct url payload', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    const today = new Date()
    await userEvent.click(screen.getByRole('radio', { name: 'PDF' }))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const payload = `${url}?month=${today.getMonth() + 1}&year=${today.getFullYear()}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
    expect(services.useGetGenerateLicenseUsageRptQuery).toHaveBeenLastCalledWith({ params, payload, selectedFormat: 'pdf' }, { skip: false })
  })
  it('when specific customer and calendar month radios checked, query called with correct url payload', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    const today = new Date()
    const mspEcTenantId = customerData.data.at(0)?.id
    await userEvent.click(screen.getByRole('radio', { name: 'Specific Customer' }))
    const dropdowns = screen.getAllByRole('combobox')
    fireEvent.mouseDown(dropdowns.at(1)!)
    await userEvent.click(screen.getByText('Din Tai Fung'))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const payload = `${url}?month=${today.getMonth() + 1}&year=${today.getFullYear()}&mspEcTenantId=${mspEcTenantId}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
    expect(services.useGetGenerateLicenseUsageRptQuery).toHaveBeenLastCalledWith({ params, payload, selectedFormat: 'csv' }, { skip: false })
  })
  it('when specific customer radio checked and calendar month period radio not checked, query called with correct url payload', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    const mspEcTenantId = customerData.data.at(0)?.id
    const startDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    const endDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    await userEvent.click(screen.getByRole('radio', { name: 'Last 24 Hours' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Specific Customer' }))
    const dropdown = screen.getByRole('combobox')
    fireEvent.mouseDown(dropdown)
    await userEvent.click(screen.getByText('Din Tai Fung'))
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    const payload = `${url}?startDate=${startDate}&endDate=${endDate}&mspEcTenantId=${mspEcTenantId}&deviceDetails=${deviceDetails}&page=${page}&dailyReportsPerPage=${dailyReportsPerPage}`
    expect(services.useGetGenerateLicenseUsageRptQuery).toHaveBeenLastCalledWith({ params, payload, selectedFormat: 'csv' }, { skip: false })
  })
  xit('error message should show up when error from request', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(({ params, payload, selectedFormat }, { skip }) => {
      if (params && payload === '' && selectedFormat === 'csv' && skip === true) {
        return {}
      }
      else return { data: { status: 404 } }
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(screen.getByText('Failed to download usage report.')).toBeVisible()
  })
  it('dialog should reset values when download is successful', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(({ params, payload, selectedFormat }, { skip }) => {
      if (params && payload === '' && selectedFormat === 'csv' && skip === true) {
        return {}
      }
      else return { data: { status: 200 } }
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))

    expect(screen.getByRole('radio', { name: 'Calendar Month' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 24 Hours' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 7 Days' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 30 Days' })).not.toBeChecked()

    expect(screen.getByRole('radio', { name: 'CSV' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'JSON' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'PDF' })).not.toBeChecked()

    expect(screen.getByRole('radio', { name: 'All Customers' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Specific Customer' })).not.toBeChecked()

    const today = new Date()
    expect(screen.getByText(months.at(today.getMonth()) + ' ' + today.getFullYear().toString())).toBeVisible()
  })
  it('dialog should reset values when cancel button is clicked', async () => {
    services.useGetGenerateLicenseUsageRptQuery = jest.fn().mockImplementation(() => {
      return {}
    })

    render(
      <Provider>
        <SubscriptionUsageReportDialog
          visible={true}
          setVisible={mockedCloseDialog}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/mspLicenses' }
      })

    expect(utils.useTableQuery).toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByRole('radio', { name: 'Calendar Month' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 24 Hours' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 7 Days' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Last 30 Days' })).not.toBeChecked()

    expect(screen.getByRole('radio', { name: 'CSV' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'JSON' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'PDF' })).not.toBeChecked()

    expect(screen.getByRole('radio', { name: 'All Customers' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Specific Customer' })).not.toBeChecked()

    const today = new Date()
    expect(screen.getByText(months.at(today.getMonth()) + ' ' + today.getFullYear().toString())).toBeVisible()
  })
})
