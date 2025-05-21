import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, PageHeader }       from '@acx-ui/components'
import { useIotControllerActions }  from '@acx-ui/rc/components'
import { useGetIotControllerQuery } from '@acx-ui/rc/services'
import { IotControllerSetting }     from '@acx-ui/rc/utils'
import {
  useParams,
  TenantLink
} from '@acx-ui/react-router-dom'
import { filterByAccess, useUserProfileContext } from '@acx-ui/user'

import IotControllerTabs from './IotControllerTabs'


function IotControllerPageHeader () {
  const { $t } = useIntl()
  const [iotControllerSettingData, setIotControllerSettingData] = useState<IotControllerSetting>()
  const { tenantId, iotId, venueId } = useParams()

  const { data: iotControllerData } = useGetIotControllerQuery({ params:
    { tenantId, iotId, venueId } })

  useEffect(() => {
    setIotControllerSettingData(iotControllerData)
  }, [iotControllerData])

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
                window.open('https://' + '' + '/admin',
                  '_blank')
              }
            >{$t({ defaultMessage: 'Mangage IoT Controller' })}</Button>,
            <TenantLink
              to={`/devices/iotController/${iotControllerData?.id}/edit`}
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
