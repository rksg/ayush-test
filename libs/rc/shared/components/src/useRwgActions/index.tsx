import { useIntl } from 'react-intl'

import { showActionModal }                                from '@acx-ui/components'
import {
  useBatchDeleteGatewayMutation, useRefreshRwgMutation
} from '@acx-ui/rc/services'
import {
  RWG
} from '@acx-ui/rc/utils'

export function useRwgActions () {
  const { $t } = useIntl()
  const [batchDeleteGateway] = useBatchDeleteGatewayMutation()
  const [refreshGatewayMutation] = useRefreshRwgMutation()

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
      onOk: () => {
        const requests = rows.map(rwg => ({ params: { venueId: rwg.venueId, rwgId: rwg.rwgId } }))
        batchDeleteGateway(requests)
          .then(callBack)
      }
    })
  }

  const refreshGateway = async () => {
    refreshGatewayMutation()
  }

  return {
    deleteGateways,
    refreshGateway
  }
}
