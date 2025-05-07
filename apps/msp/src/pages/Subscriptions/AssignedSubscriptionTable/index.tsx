
import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  useMspAssignmentHistoryQuery,
  useMspRbacAssignmentHistoryQuery
} from '@acx-ui/msp/services'
import { MspAssignmentHistory } from '@acx-ui/msp/utils'
import {
  dateSort,
  defaultSort,
  EntitlementDeviceType,
  EntitlementUtil,
  sortProp,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'
import { getIntl }   from '@acx-ui/utils'

import { entitlementAssignmentPayload } from '../AssignMspLicense'
import * as UI                          from '../styledComponent'

export function AssignedSubscriptionTable () {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)
  const isEntitlementRbacApiEnabled = useIsSplitOn(Features.ENTITLEMENT_RBAC_API)
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const solutionTokenFFToggled = useIsSplitOn(Features.ENTITLEMENT_SOLUTION_TOKEN_TOGGLE)

  const columns: TableProps<MspAssignmentHistory>['columns'] = [
    {
      title: isvSmartEdgeEnabled ? $t({ defaultMessage: 'Services' })
        : $t({ defaultMessage: 'Subscription' }),
      dataIndex: 'name',
      key: 'name',
      sorter: { compare: sortProp('name', defaultSort) }
    },
    ...(isDeviceAgnosticEnabled ? [] : [
      {
        title: $t({ defaultMessage: 'Type' }),
        dataIndex: 'deviceSubType',
        key: 'deviceSubType',
        sorter: { compare: sortProp('deviceSubType', defaultSort) },
        render: function (data: React.ReactNode, row: MspAssignmentHistory) {
          if (row.deviceType === EntitlementDeviceType.MSP_WIFI)
            return EntitlementUtil.tempLicenseToString(row.trialAssignment)
          return EntitlementUtil.deviceSubTypeToText(row.deviceSubType)
        }
      }
    ]),
    {
      title: isvSmartEdgeEnabled ? $t({ defaultMessage: 'Assigned Licenses' })
        : $t({ defaultMessage: 'Assigned Devices' }),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      sorter: { compare: sortProp('quantity', defaultSort) },
      render: function (_, row) {
        return row.quantity
      }
    },
    ...(isEntitlementRbacApiEnabled ? [
      {
        title: $t({ defaultMessage: 'Starting Date' }),
        dataIndex: 'effectiveDate',
        key: 'effectiveDate',
        sorter: { compare: sortProp('effectiveDate', dateSort) },
        render: function (_: React.ReactNode, row: MspAssignmentHistory) {
          const effectiveDate = new Date(Date.parse(row.effectiveDate as string))
          return formatter(DateFormatEnum.DateFormat)(effectiveDate)
        }
      },
      {
        title: $t({ defaultMessage: 'Expiration Date' }),
        dataIndex: 'expirationDate',
        key: 'expirationDate',
        sorter: { compare: sortProp('expirationDate', dateSort) },
        render: function (_: React.ReactNode, row: MspAssignmentHistory) {
          const expirationDate = new Date(Date.parse(row.expirationDate as string))
          return formatter(DateFormatEnum.DateFormat)(expirationDate)
        }
      },
      {
        title: $t({ defaultMessage: 'Time left' }),
        dataIndex: 'expirationDate',
        // key needs to be unique
        key: 'timeLeft',
        sorter: { compare: sortProp('expirationDate', dateSort) },
        // active license should be first
        // defaultSortOrder: 'descend',
        render: function (_: React.ReactNode, row: MspAssignmentHistory) {
          const remainingDays = EntitlementUtil.timeLeftInDays(row.expirationDate as string)
          const TimeLeftWrapper = (remainingDays <= 60 ? UI.Warning : Space)
          return <TimeLeftWrapper>{
            EntitlementUtil.timeLeftValues(remainingDays)
          }</TimeLeftWrapper>
        }
      }
    ] : [
      {
        title: $t({ defaultMessage: 'Starting Date' }),
        dataIndex: 'dateEffective',
        key: 'effectiveDate',
        sorter: { compare: sortProp('dateEffective', dateSort) },
        render: function (_: React.ReactNode, row: MspAssignmentHistory) {
          const effectiveDate = new Date(Date.parse(row.dateEffective))
          return formatter(DateFormatEnum.DateFormat)(effectiveDate)
        }
      },
      {
        title: $t({ defaultMessage: 'Expiration Date' }),
        dataIndex: 'dateExpires',
        key: 'dateExpires',
        sorter: { compare: sortProp('dateExpires', dateSort) },
        render: function (_: React.ReactNode, row: MspAssignmentHistory) {
          const expirationDate = new Date(Date.parse(row.dateExpires))
          return formatter(DateFormatEnum.DateFormat)(expirationDate)
        }
      },
      {
        title: $t({ defaultMessage: 'Time left' }),
        dataIndex: 'dateExpires',
        // key needs to be unique
        key: 'timeLeft',
        sorter: { compare: sortProp('dateExpires', dateSort) },
        // active license should be first
        // defaultSortOrder: 'descend',
        render: function (_: React.ReactNode, row: MspAssignmentHistory) {
          const remainingDays = EntitlementUtil.timeLeftInDays(row.dateExpires)
          const TimeLeftWrapper = (remainingDays <= 60 ? UI.Warning : Space)
          return <TimeLeftWrapper>{
            EntitlementUtil.timeLeftValues(remainingDays)
          }</TimeLeftWrapper>
        }
      }
    ]),
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: { compare: sortProp('status', defaultSort) },
      render: function () {
        return $t({ defaultMessage: 'Active' })
      }
    }
  ]

  const AssignedTable = () => {
    const params = useParams()
    const tableResults = useTableQuery({
      useQuery: useMspRbacAssignmentHistoryQuery,
      defaultPayload: entitlementAssignmentPayload,
      option: { skip: !isEntitlementRbacApiEnabled }
    })
    const queryResults = useMspAssignmentHistoryQuery({ params: params },
      { skip: isEntitlementRbacApiEnabled })
    const subscriptionData = isEntitlementRbacApiEnabled
      ? tableResults.data?.data.map(response => {
        const type = solutionTokenFFToggled
          ? response?.licenseType === 'APSW'
            ? $t({ defaultMessage: 'Device Networking' })
            : response?.licenseType === 'SLTN_TOKEN'
              ? $t({ defaultMessage: 'Solution Tokens' })
              : $t({ defaultMessage: 'Devices' })
          : $t({ defaultMessage: 'Devices' })

        return {
          ...response,
          name: (response?.isTrial
            ? $t({ defaultMessage: 'Trial {type}' }, { type })
            : $t({ defaultMessage: 'Paid {type}' }, { type }))
        }
      })
      : queryResults.data?.map(response => {
        const type = isvSmartEdgeEnabled ? $t({ defaultMessage: 'Device Networking' })
          : EntitlementUtil.getDeviceTypeText(getIntl().$t, response?.deviceType)
        return {
          ...response,
          name: isDeviceAgnosticEnabled ? (response?.trialAssignment
            ? $t({ defaultMessage: 'Trial {type}' }, { type })
            : $t({ defaultMessage: 'Paid {type}' }, { type }))
            : type
        }
      }).filter(rec => rec.status === 'VALID' && rec.mspEcTenantId === tenantId)

    return (
      <Loader states={[queryResults]}>
        <Table
          style={{ marginTop: '12px' }}
          settingsId='msp-assigned-subscription-table'
          columns={columns}
          dataSource={subscriptionData}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <AssignedTable />
  )
}
