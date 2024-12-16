import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                             from '@acx-ui/components'
import { DateFormatEnum, formatter }                                             from '@acx-ui/formatter'
import { useMspCustomerListQuery }                                               from '@acx-ui/msp/services'
import { ComplianceMspCustomersDevicesTypes, MspEc, MspEcAccountType, MSPUtils } from '@acx-ui/msp/utils'
import { useGetTenantDetailsQuery }                                              from '@acx-ui/rc/services'
import { EntitlementUtil, useTableQuery }                                        from '@acx-ui/rc/utils'
import { noDataDisplay }                                                         from '@acx-ui/utils'

import * as UI from './styledComponents'

export default function MspCustomersLicences () {

  const { $t } = useIntl()
  const mspUtils = MSPUtils()

  const mspEcTenantsPayload = {
    filters: {
      tenantType: ['MSP_EC', 'MSP_INTEGRATOR', 'MSP_INSTALLER']
    },
    fields: [
      'check-all',
      'id',
      'name',
      'tenantType',
      'status',
      'streetAddress'
    ]
  }
  const settingsId = 'compliance-msp-customers-table'

  const tableQuery = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: mspEcTenantsPayload,
    search: {
      searchTargetFields: ['name'],
      searchString: ''
    },
    pagination: { settingsId }
  })

  const { data: tenantDetailsData } = useGetTenantDetailsQuery({ })

  const _statusFilterOptions = [{ key: MspEcAccountType.TRIAL,
    value: 'MSP ECs in Trial Mode' },
  { key: MspEcAccountType.PAID,
    value: 'MSP ECs in Paid Mode' }]

  const statusFilterOptions = tenantDetailsData?.extendedTrial
    ? [..._statusFilterOptions, { key: MspEcAccountType.EXTENDED_TRIAL,
      value: 'MSP ECs in Extended Trial Mode' }] : _statusFilterOptions

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      filterMultiple: false,
      filterValueNullable: true,
      filterKey: 'status',
      filterable: statusFilterOptions,
      sorter: true,
      width: 120,
      render: function (_, row) {
        return $t(mspUtils.getStatus(row))
      }
    },
    {
      title: $t({ defaultMessage: 'Service Expires' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      render: function (_, row) {
        const nextExpirationDate = mspUtils.transformExpirationDate(row)
        if (nextExpirationDate === noDataDisplay)
          return nextExpirationDate
        const formattedDate = formatter(DateFormatEnum.DateFormat)(nextExpirationDate)
        const expiredOnString = `${$t({ defaultMessage: 'Expired on' })} ${formattedDate}`
        const remainingDays = EntitlementUtil.timeLeftInDays(nextExpirationDate)
        const TimeLeftWrapper = remainingDays < 0
          ? UI.Expired
          : (remainingDays <= 60 ? UI.Warning : Space)
        return <TimeLeftWrapper>
          {remainingDays < 0 ? expiredOnString : formattedDate}
        </TimeLeftWrapper>
      }
    },
    {
      title: $t({ defaultMessage: 'Assigned Licenses' }) ,
      dataIndex: 'apswLicense',
      key: 'apswLicense',
      align: 'center',
      sorter: false,
      width: 140,
      render: function (data: React.ReactNode, row: MspEc) {
        return mspUtils.transformDeviceEntitlement(row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Licenses Available' }) ,
      dataIndex: 'availableLicenses',
      key: 'availableLicenses',
      align: 'center',
      sorter: false,
      width: 140,
      render: function (data: React.ReactNode, row: MspEc) {
        const nextExpirationDate = mspUtils.transformExpirationDate(row)
        const remainingDays = EntitlementUtil.timeLeftInDays(nextExpirationDate)
        return remainingDays < 0 ? 0 : mspUtils.transformAvailableLicenses(row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Licenses Used' }),
      dataIndex: 'apswLicenseInstalled',
      key: 'apswLicenseInstalled',
      align: 'center',
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.transformInstalledDevice(row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Configured APs' }),
      dataIndex: 'wifiDeviceCount',
      key: 'wifiDeviceCount',
      align: 'center',
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(ComplianceMspCustomersDevicesTypes.AP,
          row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Configured Switches' }),
      dataIndex: 'switchDeviceCount',
      key: 'switchDeviceCount',
      align: 'center',
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(ComplianceMspCustomersDevicesTypes.SWITCH,
          row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Configured Edge vAppliances' }),
      dataIndex: 'edgeDeviceCount',
      key: 'edgeDeviceCount',
      align: 'center',
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(ComplianceMspCustomersDevicesTypes.EDGE,
          row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Configured RWGs' }),
      dataIndex: 'rwgDeviceCount',
      key: 'rwgDeviceCount',
      align: 'center',
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(ComplianceMspCustomersDevicesTypes.RWG,
          row.entitlements)
      }
    }
  ]
  return <Loader states={[tableQuery]}>
    <Table<MspEc>
      columns={columns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      settingsId='msp-applied-template-table'
      rowKey='id'
      enableApiFilter={true}
    />
  </Loader>
}