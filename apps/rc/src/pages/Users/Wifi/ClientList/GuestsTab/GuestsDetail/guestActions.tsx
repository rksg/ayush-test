import { useIntl } from 'react-intl'

import { showActionModal }  from '@acx-ui/components'
import {
  useGetGuestsMutation,
  useEnableGuestsMutation,
  useDisableGuestsMutation,

  useDeleteGuestsMutation
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

  const showDownloadInformation = (guest: Guest | Guest[], tenantId?: string) => {
    const dateFormat = 'yyyy/MM/dd HH:mm' //TODO: Wait for User profile
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const guestIds = Array.isArray(guest) ? guest.map(g => g.id) : [guest.id]

    getGuests({ params: { tenantId }, payload: { dateFormat, timezone, guestIds } })
      .catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const showDeleteGuest = async (guest: Guest | Guest[],
    tenantId?: string, callBack?: ()=>void) => {
    const guests = Array.isArray(guest) ? guest : [guest]

    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'Guest' }),
        entityValue: guests[0].name,
        numOfEntities: guests.length
      },
      onOk: () => {
        deleteGuests({ params: { tenantId }, payload: guests.map(g => g.id) }).then(
          callBack
        )
      }
    })
  }

  const disableGuest = async (guest: Guest, tenantId?: string) => {
    disableGuests({ params: { tenantId, guestId: guest.id } })
  }

  const enableGuest = async (guest: Guest, tenantId?: string) => {
    enableGuests({ params: { tenantId, guestId: guest.id } })
  }

  return {
    showDownloadInformation,
    disableGuest,
    enableGuest,
    showDeleteGuest
  }
}

