import { useIntl } from 'react-intl'

import { showActionModal }   from '@acx-ui/components'
import {
  useGetGuestsMutation,
  useDeleteGuestMutation,
  useEnableGuestsMutation,
  useDisableGuestsMutation
} from '@acx-ui/rc/services'
import {
  Guest
} from '@acx-ui/rc/utils'

export function useGuestActions () {
  const { $t } = useIntl()
  const[ getGuests ] = useGetGuestsMutation()
  const [deleteGuest] = useDeleteGuestMutation()
  const [enableGuests] = useEnableGuestsMutation()
  const [disableGuests] = useDisableGuestsMutation()

  const showDownloadInformation = (guest: Guest | Guest[], tenantId?: string) => {
    const id = Array.isArray(guest) ? guest.map(g => g.id) : [guest.id]

    getGuests({ params: { tenantId }, payload: { filters: { id }, page: 1, pageSize: id.length } })
      .catch((error) => {
        console.log(error) // eslint-disable-line no-console
      })
  }

  const showDeleteGuest = async (guest: Guest | Guest[],
    tenantId?: string, callBack?: ()=>void) => {
    const isMultiple = Array.isArray(guest) && guest.length > 1
    const guests = Array.isArray(guest) ? guest : [guest]

    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'DELETE',
        entityName: isMultiple? $t({ defaultMessage: 'Guests' }) : $t({ defaultMessage: 'Guest' }),
        entityValue: guests[0].name,
        numOfEntities: guests.length
      },
      onOk: () => {
        guests.forEach(g => {
          deleteGuest({ params: { tenantId, networkId: g.wifiNetworkId, guestId: g.id } })
        })
        callBack && callBack()
      }
    })
  }

  const disableGuest = async (guest: Guest, tenantId?: string) => {
    disableGuests({
      params: { tenantId, networkId: guest.wifiNetworkId, guestId: guest.id },
      payload: { disabled: true }
    })
  }

  const enableGuest = async (guest: Guest, tenantId?: string) => {
    enableGuests({
      params: { tenantId, networkId: guest.wifiNetworkId, guestId: guest.id },
      payload: { disabled: false }
    })
  }

  return {
    showDownloadInformation,
    disableGuest,
    enableGuest,
    showDeleteGuest
  }
}

