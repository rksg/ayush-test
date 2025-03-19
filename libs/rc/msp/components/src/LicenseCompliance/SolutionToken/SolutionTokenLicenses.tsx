import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }                                             from '@acx-ui/components'
import { Features, useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                             from '@acx-ui/formatter'
import { useMspCustomerListQuery }                                               from '@acx-ui/msp/services'
import { ComplianceMspCustomersDevicesTypes, MspEc, MspEcAccountType, MSPUtils } from '@acx-ui/msp/utils'
import { useGetTenantDetailsQuery }                                              from '@acx-ui/rc/services'
import { EntitlementNetworkDeviceType, EntitlementUtil, useTableQuery }          from '@acx-ui/rc/utils'
import { noDataDisplay }                                                         from '@acx-ui/utils'

import * as UI from '../styledComponents'

export declare type AlignType = 'left' | 'center' | 'right'
export default function SolutionTokenLicenses () {

  const { $t } = useIntl()
  const mspUtils = MSPUtils()
  const adaptivePolicyToggle = useIsSplitOn(Features.ENTITLEMENT_ADAPTIVE_POLICY_TOGGLE)
  const sisIntegrationToggle = useIsSplitOn(Features.ENTITLEMENT_SIS_INTEGRATION_TOGGLE)
  const pmsIntegrationToggle = useIsSplitOn(Features.ENTITLEMENT_PMS_INTEGRATION_TOGGLE)
  const hybridCloudSecToggle = useIsSplitOn(Features.ENTITLEMENT_HYBRID_CLOUD_SECURITY_TOGGLE)
  const piNetworkToggle = useIsSplitOn(Features.ENTITLEMENT_PIN_FOR_IDENTITY_TOGGLE)

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
  const settingsId = 'solution-token-licenses-table'

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
    value: $t({ defaultMessage: 'MSP ECs in Trial Mode' }) },
  { key: MspEcAccountType.PAID,
    value: $t({ defaultMessage: 'MSP ECs in Paid Mode' }) }]

  const statusFilterOptions = tenantDetailsData?.extendedTrial
    ? [..._statusFilterOptions, { key: MspEcAccountType.EXTENDED_TRIAL,
      value: $t({ defaultMessage: 'MSP ECs in Extended Trial Mode' }) }] : _statusFilterOptions

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left'
    },
    {
      title: $t({ defaultMessage: 'Service Status' }),
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
        const expiredOnString = $t({ defaultMessage: 'Expired on {date}' }, { date: formattedDate })
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
        return mspUtils.transformDeviceEntitlement(row.entitlements,
          EntitlementNetworkDeviceType.SLTN_TOKEN)
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
        return remainingDays < 0 ? 0 : mspUtils.transformAvailableLicenses(row.entitlements,
          EntitlementNetworkDeviceType.SLTN_TOKEN)
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
        return mspUtils.transformInstalledDevice(row.entitlements,
          EntitlementNetworkDeviceType.SLTN_TOKEN)
      }
    },
    ...(adaptivePolicyToggle ? [{
      title: $t({ defaultMessage: 'Adaptive Policy' }),
      dataIndex: 'adaptivePolicyCount',
      key: 'adaptivePolicyCount',
      align: 'center' as AlignType,
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(ComplianceMspCustomersDevicesTypes.SLTN_ADAPT_POLICY,
          row.entitlements)
      }
    }] : []),
    ...(piNetworkToggle ? [{
      title: $t({ defaultMessage: 'PIN For Ruckus One Identity' }),
      dataIndex: 'piNetworkCount',
      key: 'piNetworkCount',
      align: 'center' as AlignType,
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(
          ComplianceMspCustomersDevicesTypes.SLTN_PIN_FOR_IDENTITY,
          row.entitlements)
      }
    }] : []),
    ...(sisIntegrationToggle ? [{
      title: $t({ defaultMessage: 'SIS Integration' }),
      dataIndex: 'sisIntegrationCount',
      key: 'sisIntegrationCount',
      align: 'center' as AlignType,
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(ComplianceMspCustomersDevicesTypes.SLTN_SIS_INT,
          row.entitlements)
      }
    }] : []),
    ...(pmsIntegrationToggle ? [{
      title: $t({ defaultMessage: 'PMS Integration' }),
      dataIndex: 'pmsIntegrationCount',
      key: 'pmsIntegrationCount',
      align: 'center' as AlignType,
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(ComplianceMspCustomersDevicesTypes.SLTN_PMS_INT,
          row.entitlements)
      }
    }] : []),
    ...( hybridCloudSecToggle ? [{
      title: $t({ defaultMessage: 'Hybrid Cloud Security' }),
      dataIndex: 'hybridCloudSecCount',
      key: 'hybridCloudSecCount',
      align: 'center' as AlignType,
      sorter: false,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.getConfiguredDevices(
          ComplianceMspCustomersDevicesTypes.SLTN_HYBRID_CLOUD_SEC,
          row.entitlements)
      }
    }] : [])
  ]
  return <Loader states={[tableQuery]}>
    <Table<MspEc>
      columns={columns}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      settingsId={settingsId}
      rowKey='id'
      enableApiFilter={true}
    />
  </Loader>
}