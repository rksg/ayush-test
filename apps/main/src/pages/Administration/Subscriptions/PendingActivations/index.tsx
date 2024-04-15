import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  Table,
  TableProps,
  showToast
} from '@acx-ui/components'
import { get }                        from '@acx-ui/config'
import { DateFormatEnum, formatter }  from '@acx-ui/formatter'
import { SpaceWrapper }               from '@acx-ui/rc/components'
import {
  useRefreshEntitlementsMutation,
  useInternalRefreshEntitlementsMutation,
  useGetEntitlementActivationsQuery
} from '@acx-ui/rc/services'
import {
  AdministrationUrlsInfo,
  EntitlementActivations
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

const PendingActivationsTable = () => {
  const { $t } = useIntl()
  const params = useParams()

  const pendingActivationPayload = {
    filters: { status: ['PENDING'] }
  }
  const { data: pendingActivationResults }
    = useGetEntitlementActivationsQuery({ params: useParams(), payload: pendingActivationPayload })

  const isNewApi = AdministrationUrlsInfo.refreshLicensesData.newApi
  const [ refreshEntitlement ] = useRefreshEntitlementsMutation()
  const [ internalRefreshEntitlement ] = useInternalRefreshEntitlementsMutation()
  //   const [bannerRefreshLoading, setBannerRefreshLoading] = useState<boolean>(false)

  const columns: TableProps<EntitlementActivations>['columns'] = [
    {
      title: $t({ defaultMessage: 'Order Date' }),
      dataIndex: 'orderCreateDate',
      key: 'orderCreateDate'
    },
    {
      title: $t({ defaultMessage: 'SPA Activation Code' }),
      dataIndex: 'orderAcxRegistrationCode',
      key: 'orderAcxRegistrationCode',
      render: function (_, row) {
        return <Button
          type='link'
          onClick={() => {
            const urlSupportActivation = 'http://support.ruckuswireless.com/register_code/' +
              row.orderAcxRegistrationCode
            window.open(urlSupportActivation, '_blank')
          }}
        >{row.orderAcxRegistrationCode}</Button>
      }
    },
    {
      title: $t({ defaultMessage: 'Part Number' }),
      dataIndex: 'productCode',
      key: 'productCode',
      filterable: true
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
      key: 'subscriptionTerm'
    },
    {
      title: $t({ defaultMessage: 'Activation Period Ends on' }),
      dataIndex: 'spaEndDate',
      key: 'spaEndDate',
      render: function (_, row) {
        return formatter(DateFormatEnum.DateFormat)(row.spaEndDate)
      }
    }
  ]

  const refreshFunc = async () => {
    // setBannerRefreshLoading(true)
    try {
      await (isNewApi ? refreshEntitlement : internalRefreshEntitlement)({ params }).unwrap()
      if (isNewApi === false) {
        showToast({
          type: 'success',
          content: $t({
            defaultMessage: 'Successfully refreshed.'
          })
        })
      }
    //   setBannerRefreshLoading(false)
    } catch (error) {
    //   setBannerRefreshLoading(false)
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

  return (
    <Loader>
      <Table
        columns={columns}
        actions={filterByAccess(actions)}
        dataSource={pendingActivationResults?.data}
        rowKey='orderId'
      />
    </Loader>
  )
}

const PendingActivations = () => {
  return (
    <SpaceWrapper fullWidth size='large' direction='vertical'>
      <PendingActivationsTable />
    </SpaceWrapper>
  )
}

export default PendingActivations
