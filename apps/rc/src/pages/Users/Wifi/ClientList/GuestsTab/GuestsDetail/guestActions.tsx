import { useIntl } from 'react-intl'

import { showActionModal, showToast } from '@acx-ui/components'
import {
  useGetGuestsMutation,
  useDeleteGuestsMutation,
  useGuestActionMutation
} from '@acx-ui/rc/services'
import {
  Guest
} from '@acx-ui/rc/utils'

export function useGuestActions () {
  const { $t } = useIntl()
  const[ getGuests ] = useGetGuestsMutation()
  const [deleteGuests] = useDeleteGuestsMutation()
  const [guestsAction] = useGuestActionMutation()

  const showDownloadInformation = (guest: Guest) => {
    const dateFormat = 'yyyy/MM/dd HH:mm' //TODO: Wait for User profile
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const guestIds = [guest.id]

    getGuests({ payload: { dateFormat, timezone, guestIds } })
      .catch(() => {
        showToast({
          type: 'error',
          content: $t({ defaultMessage: 'Failed to download Information.' })
        })
      })
  }

  const showDeleteGuest = async (guest: Guest, callBack?: ()=>void) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Guest' }),
        entityValue: guest.name,
        numOfEntities: 1
      },
      onOk: () => {
        deleteGuests({ payload: [guest.id] }).then(
          callBack
        )
      }
    })
  }

  const disableGuest = async (guest: Guest) => {
    guestsAction({ params: { guestId: guest.id }, payload: { action: 'disabled' } })
  }

  const enableGuest = async (guest: Guest) => {
    guestsAction({ params: { guestId: guest.id }, payload: { action: 'enabled' } })
  }

  return {
    showDownloadInformation,
    disableGuest,
    enableGuest,
    showDeleteGuest
  }
}

