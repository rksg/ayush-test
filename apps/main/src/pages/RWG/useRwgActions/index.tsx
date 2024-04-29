import { useIntl } from 'react-intl'

import { showActionModal }   from '@acx-ui/components'
import {
  useDeleteGatewayMutation
} from '@acx-ui/rc/services'
import {
  RWG
} from '@acx-ui/rc/utils'

export function useRwgActions () {
  const { $t } = useIntl()
  const [deleteGateway] = useDeleteGatewayMutation()

  const deleteGateways = async ( rows: RWG[], tenantId?: string, callBack?: ()=>void ) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: rows.length === 1? $t({ defaultMessage: 'Gateway' })
          : $t({ defaultMessage: 'Gateways' }),
        entityValue: rows.length === 1 ? rows[0].name : undefined,
        numOfEntities: rows.length,
        confirmationText: $t({ defaultMessage: 'Delete' })
      },
      onOk: () => { rows.length === 1 ?
        deleteGateway({ params: { tenantId, rwgId: rows[0].rwgId } })
          .then(callBack) :
        deleteGateway({ params: { tenantId }, payload: rows.map(item => item.rwgId) })
          .then(callBack)
      }
    })
  }

  return {
    deleteGateways
  }
}
