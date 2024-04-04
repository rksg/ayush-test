import { useIntl } from 'react-intl'

import {
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
  sortProp,
  defaultSort,
  dateSort,
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
      key: 'orderCreateDate',
      sorter: { compare: sortProp('orderCreateDate', dateSort) }
    },
    {
      title: $t({ defaultMessage: 'SPA Activation Code' }),
      dataIndex: 'orderAcxRegistrationCode',
      key: 'orderAcxRegistrationCode'
    },
    {
      title: $t({ defaultMessage: 'Part Number' }),
      dataIndex: 'productCode',
      key: 'productCode',
      filterable: true,
      sorter: { compare: sortProp('productCode', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Part Number Description' }),
      dataIndex: 'productName',
      key: 'productName',
      sorter: { compare: sortProp('productName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Quantity' }),
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      sorter: { compare: sortProp('quantity', defaultSort) },
      render: function (_, row) {
        return row.quantity
      }
    },
    {
      title: $t({ defaultMessage: 'Subscription Term' }),
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      sorter: { compare: sortProp('effectiveDate', dateSort) }
    },
    {
      title: $t({ defaultMessage: 'Activation Period Ends on' }),
      dataIndex: 'spaEndDate',
      key: 'spaEndDate',
      sorter: { compare: sortProp('spaEndDate', dateSort) },
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
      label: $t({ defaultMessage: 'Manage Subsciptions' }),
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
