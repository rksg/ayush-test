import { useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }  from '@acx-ui/formatter'
import { SpaceWrapper }               from '@acx-ui/rc/components'
import {
  useGetEntitlementActivationsQuery
} from '@acx-ui/rc/services'
import {
  AdministrationUrlsInfo,
  EntitlementActivations
} from '@acx-ui/rc/utils'
import { useParams }                                      from '@acx-ui/react-router-dom'
import { RolesEnum }                                      from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations, hasRoles } from '@acx-ui/user'
import { getOpsApi, noDataDisplay }                       from '@acx-ui/utils'

import { ActivatePurchaseDrawer } from '../ActivatePurchaseDrawer'

const PendingActivationsTable = () => {
  const { $t } = useIntl()
  const [activationData, setActivationData] = useState<EntitlementActivations>()
  const [drawerActivateVisible, setDrawerActivateVisible] = useState(false)
  const isActivatePendingActivationEnabled =
    useIsSplitOn(Features.ENTITLEMENT_ACTIVATE_PENDING_ACTIVATION_TOGGLE)
  const { rbacOpsApiEnabled } = getUserProfile()
  const hasPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.patchEntitlementsActivations)])
    : hasRoles([RolesEnum.PRIME_ADMIN])

  const showActivateLink = hasPermission && isActivatePendingActivationEnabled

  const pendingActivationPayload = {
    filters: { status: ['PENDING'] }
  }
  const pendingActivationResults
    = useGetEntitlementActivationsQuery({ params: useParams(), payload: pendingActivationPayload })

  const columns: TableProps<EntitlementActivations>['columns'] = [
    {
      title: $t({ defaultMessage: 'Order Date' }),
      dataIndex: 'orderCreateDate',
      key: 'orderCreateDate',
      width: 120,
      render: function (_, row) {
        return row.isChild ? '' : formatter(DateFormatEnum.DateFormat)(row.orderCreateDate)
      }
    },
    {
      title: $t({ defaultMessage: 'SPA Activation Code' }),
      dataIndex: 'orderAcxRegistrationCode',
      width: 220,
      key: 'orderAcxRegistrationCode',
      render: function (_, row) {
        return row.isChild ? '' : row.orderAcxRegistrationCode
      }
    },
    {
      title: $t({ defaultMessage: 'Part Number' }),
      dataIndex: 'productCode',
      key: 'productCode',
      width: 220,
      render: function (_, row) {
        return showActivateLink ? <Button
          type='link'
          onClick={() => {
            setDrawerActivateVisible(true)
            setActivationData(row)
          }}
        >{row.productCode}</Button> : row.productCode
      }
    },
    {
      title: $t({ defaultMessage: 'Part Number Description' }),
      dataIndex: 'productName',
      width: 220,
      key: 'productName'
    },
    {
      title: $t({ defaultMessage: 'Quantity' }),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 90,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Subscription Term' }),
      dataIndex: 'subscriptionTerm',
      key: 'subscriptionTerm',
      width: 160,
      render: function (_, row) {
        const terms =
          moment.duration(moment(row.spaEndDate).diff(moment(row.spaStartDate))).asDays()/30
        return Math.floor(terms) + ' ' + $t({ defaultMessage: 'mos' })
      }
    },
    {
      title: $t({ defaultMessage: 'Last Day of Grace Activation Period' }),
      dataIndex: 'spaStartDate',
      key: 'spaStartDate',
      width: 260,
      render: function (_, row) {
        return row.productClass === 'ACX-TRIAL-NEW' || row.trial
          ? noDataDisplay
          : formatter(DateFormatEnum.DateFormat)(row.spaStartDate)
      }
    }
  ]

  let spaActivationCodes:string[] = []
  const GetChildStatus = (spaCode: string) => {
    if (spaActivationCodes.includes(spaCode)) {
      return true
    } else {
      spaActivationCodes.push(spaCode)
      return false
    }
  }

  const subscriptionData = pendingActivationResults.data?.data.map(response => {
    return {
      ...response,
      isChild: GetChildStatus(response?.orderAcxRegistrationCode)
    }
  })

  return (
    <Loader states={[pendingActivationResults
    ]}>
      <Table
        settingsId='pending-activation-table'
        columns={columns}
        dataSource={subscriptionData}
        stickyHeaders={false}
        rowKey='orderId'
      />
      {drawerActivateVisible && <ActivatePurchaseDrawer
        visible={drawerActivateVisible}
        setVisible={setDrawerActivateVisible}
        activationData={activationData}
      />}

    </Loader>
  )
}

export const PendingActivations = () => {
  return (
    <SpaceWrapper fullWidth size='large' direction='vertical'>
      <PendingActivationsTable />
    </SpaceWrapper>
  )
}
