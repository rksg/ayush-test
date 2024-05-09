import { useState } from 'react'

import moment      from 'moment'
import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { get }                        from '@acx-ui/config'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }  from '@acx-ui/formatter'
import { SpaceWrapper }               from '@acx-ui/rc/components'
import {
  useRefreshEntitlementsMutation,
  useGetEntitlementActivationsQuery
} from '@acx-ui/rc/services'
import {
  EntitlementActivations
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'
import { noDataDisplay }  from '@acx-ui/utils'

import { ActivatePurchaseDrawer } from '../ActivatePurchaseDrawer'

const PendingActivationsTable = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [activationData, setActivationData] = useState<EntitlementActivations>()
  const [drawerActivateVisible, setDrawerActivateVisible] = useState(false)
  const isActivatePendingActivationEnabled =
    useIsSplitOn(Features.ENTITLEMENT_ACTIVATE_PENDING_ACTIVATION_TOGGLE)

  const pendingActivationPayload = {
    filters: { status: ['PENDING'] }
  }
  const pendingActivationResults
    = useGetEntitlementActivationsQuery({ params: useParams(), payload: pendingActivationPayload })

  const [ refreshEntitlement ] = useRefreshEntitlementsMutation()

  const columns: TableProps<EntitlementActivations>['columns'] = [
    {
      title: $t({ defaultMessage: 'Order Date' }),
      dataIndex: 'orderCreateDate',
      key: 'orderCreateDate',
      render: function (_, row) {
        return row.isChild ? '' : formatter(DateFormatEnum.DateFormat)(row.orderCreateDate)
      }
    },
    {
      title: $t({ defaultMessage: 'SPA Activation Code' }),
      dataIndex: 'orderAcxRegistrationCode',
      key: 'orderAcxRegistrationCode',
      render: function (_, row) {
        return row.isChild ? '' : <Button
          type='link'
          onClick={() => {
            const licenseUrl = get('MANAGE_LICENSES')
            const support = new URL(licenseUrl).hostname
            const urlSupportActivation =
                  `http://${support}/register_code/${row.orderAcxRegistrationCode}`
            window.open(urlSupportActivation, '_blank')
          }}
        >{row.orderAcxRegistrationCode}</Button>
      }
    },
    {
      title: $t({ defaultMessage: 'Part Number' }),
      dataIndex: 'productCode',
      key: 'productCode',
      render: function (_, row) {
        return isActivatePendingActivationEnabled ? <Button
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
      key: 'productName'
    },
    {
      title: $t({ defaultMessage: 'Quantity' }),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Subscription Term' }),
      dataIndex: 'subscriptionTerm',
      key: 'subscriptionTerm',
      render: function (_, row) {
        const terms =
          moment.duration(moment(row.spaEndDate).diff(moment(row.spaStartDate))).asDays()/30
        return Math.floor(terms) + ' ' + $t({ defaultMessage: 'mos' })
      }
    },
    {
      title: $t({ defaultMessage: 'Activation Period Ends on' }),
      dataIndex: 'spaEndDate',
      key: 'spaEndDate',
      render: function (_, row) {
        return row.productClass === 'ACX-TRIAL-NEW'
          ? noDataDisplay
          : formatter(DateFormatEnum.DateFormat)(row.spaEndDate)
      }
    }
  ]

  const refreshFunc = async () => {
    try {
      await (refreshEntitlement)({ params }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const actions: TableProps<EntitlementActivations>['actions'] = [
    {
      label: $t({ defaultMessage: 'Manage Subscriptions' }),
      onClick: () => {
        const licenseUrl = get('MANAGE_LICENSES')
        window.open(licenseUrl, '_blank')
      }
    },
    {
      label: $t({ defaultMessage: 'Refresh' }),
      onClick: refreshFunc
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
        columns={columns}
        actions={filterByAccess(actions)}
        dataSource={subscriptionData}
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
