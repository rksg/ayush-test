import { useIntl } from 'react-intl'

import { showActionModal, showToast } from '@acx-ui/components'
import {
  useGetGuestsMutation,
  useDeleteGuestsMutation,
  useEnableGuestsMutation,
  useDisableGuestsMutation
} from '@acx-ui/rc/services'
import {
  Guest
} from '@acx-ui/rc/utils'

export function useGuestActions () {
  const { $t } = useIntl()
  const[ getGuests ] = useGetGuestsMutation()
  const [deleteGuests] = useDeleteGuestsMutation()
  const [enableGuests] = useEnableGuestsMutation()
  const [disableGuests] = useDisableGuestsMutation()

  const showDownloadInformation = (guest: Guest, tenantId?: string) => {
    const dateFormat = 'yyyy/MM/dd HH:mm' //TODO: Wait for User profile
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const guestIds = [guest.id]

    getGuests({ params: { tenantId }, payload: { dateFormat, timezone, guestIds } })
      .catch(() => {
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'Failed to download Information.' })
        })
      })
  }

  const showDeleteGuest = async (guest: Guest, tenantId?: string, callBack?: ()=>void) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Guest' }),
        entityValue: guest.name,
        numOfEntities: 1
      },
      onOk: () => {
        deleteGuests({ params: { tenantId }, payload: [guest.id] }).then(
          callBack
        )
      }
    })
  }

  const disableGuest = async (guest: Guest, tenantId?: string) => {
    disableGuests({ params: { tenantId, guestId: guest.id }, payload: { action: 'disabled' } })
  }

  const enableGuest = async (guest: Guest, tenantId?: string) => {
    enableGuests({ params: { tenantId, guestId: guest.id }, payload: { action: 'enabled' } })
  }

  return {
    showDownloadInformation,
    disableGuest,
    enableGuest,
    showDeleteGuest
  }
}

