import { useIntl } from 'react-intl'

import {
  showActionModal
} from '@acx-ui/components'
import {
  useDeleteIotControllerMutation, useRefreshIotControllerMutation
} from '@acx-ui/rc/services'
import {
  IotControllerStatus
} from '@acx-ui/rc/utils'

export function useIotControllerActions () {
  const { $t } = useIntl()
  const [ invokeDeleteIotController ] = useDeleteIotControllerMutation()
  const [refreshIotControllerMutation] = useRefreshIotControllerMutation()

  // eslint-disable-next-line max-len
  const deleteIotController = async ( rows: IotControllerStatus[], tenantId?: string, callBack?: ()=>void ) => {
    const handleOk = () => {
      const requests = []
      for(let item of rows) {
        requests.push(invokeDeleteIotController({
          params: {
            iotId: item.id
          }
        }))
      }
      Promise.all(requests).then(() => callBack?.())
    }

    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: rows.length === 1? $t({ defaultMessage: 'Iot Controller' })
          : $t({ defaultMessage: 'Iot Controller' }),
        entityValue: rows.length === 1 ? rows[0].name : undefined,
        numOfEntities: rows.length,
        confirmationText: $t({ defaultMessage: 'Delete' })
      },
      onOk: handleOk
    })
  }

  const refreshIotController = async () => {
    refreshIotControllerMutation()
  }

  return {
    deleteIotController,
    refreshIotController
  }
}
