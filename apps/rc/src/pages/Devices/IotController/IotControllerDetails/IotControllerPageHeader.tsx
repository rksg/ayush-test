import { useIntl } from 'react-intl'

import { Button, PageHeader }           from '@acx-ui/components'
import { useIotControllerActions }      from '@acx-ui/rc/components'
import { useGetIotControllerListQuery } from '@acx-ui/rc/services'
import { IotControllerSetting }         from '@acx-ui/rc/utils'
import {
  useParams,
  TenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext } from '@acx-ui/user'

import IotControllerTabs from './IotControllerTabs'


function IotControllerPageHeader () {
  const { $t } = useIntl()
  const { iotId } = useParams()
  const params = useParams()

  const { availableIotControllers } = useGetIotControllerListQuery({
    payload: {
      fields: [
        'id',
        'name',
        'inboundAddress',
        'publicAddress',
        'publicPort',
        'tenantId',
        'status',
        'assocVenueId'
      ],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC',
      filters: { tenantId: [params.tenantId] }
    }
  }, {
    selectFromResult: ({ data, isLoading, isFetching }) => ({
      isLoading,
      isFetching,
      availableIotControllers: data?.data.map(item => ({
        ...item
      })) ?? []
    })
  })

  // eslint-disable-next-line max-len
  const iotControllerSettingData = availableIotControllers?.find((item: IotControllerSetting) => item.id === iotId)

  const iotControllerActions = useIotControllerActions()
  const { isCustomRole } = useUserProfileContext()

  return (
    <PageHeader
      title={iotControllerSettingData?.name}
      breadcrumb={[
        { text: $t({ defaultMessage: 'IoT Controller List' }), link: '/devices/iotController' }
      ]}
      extra={[
        ...filterByAccess([
          <Button
            type='default'
            onClick={() =>
              iotControllerActions.refreshIotController()
            }
          >{$t({ defaultMessage: 'Refresh' })}</Button>,
          ...(isCustomRole ? []
            : [<Button
              type='default'
              onClick={() =>
                // eslint-disable-next-line max-len
                window.open('https://' + iotControllerSettingData?.publicAddress + ':' + iotControllerSettingData?.publicPort,
                  '_blank')
              }
            >{$t({ defaultMessage: 'Mangage IoT Controller' })}</Button>,
            <TenantLink
              to={`/devices/iotController/${iotControllerSettingData?.id}/edit`}
            >
              <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
            </TenantLink>])])
      ]}
      // eslint-disable-next-line max-len
      footer={<IotControllerTabs iotControllerSetting={iotControllerSettingData as IotControllerSetting} />}
    />
  )
}

export default IotControllerPageHeader
