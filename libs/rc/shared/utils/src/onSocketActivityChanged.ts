import { getUserProfile }          from '@acx-ui/user'
import { offActivity, onActivity } from '@acx-ui/utils'

import { Transaction } from '.'

export async function onSocketActivityChanged <Payload> (
  _payload: Payload,
  api: {
    cacheDataLoaded: Promise<{ data: unknown, meta: unknown }>,
    cacheEntryRemoved: Promise<void>
  },
  handler: (activityData: Transaction) => void
) {
  const { cacheDataLoaded, cacheEntryRemoved } = api

  await cacheDataLoaded

  const onActivityChangedEvent = (data: string) => {
    const userProfile = getUserProfile()
    const jsonData = JSON.parse(data)
    if(userProfile.abacEnabled){

      const getPermittedVenues = () => {

        const isVenuesScope = jsonData?.scopeType === 'venues'

        //RBAC phase 2 support non-venues scope
        if(userProfile.rbacOpsApiEnabled && !isVenuesScope) return true

        return isVenuesScope && jsonData?.scopeIds?.some(
          (id: string) => {
            const isAllVenue = id === 'all'
            const isIncludedInList = userProfile.venuesList?.includes(id)

            // (RBAC phase 1 + ff || RBAC phase 2) support 'all' venues
            const supportsAll = userProfile.allVenuesEnabled || userProfile.rbacOpsApiEnabled
            return supportsAll ? isIncludedInList || isAllVenue : isIncludedInList
          }
        )

      }

      const hasPermittedVenue = getPermittedVenues()

      if(userProfile.hasAllVenues || hasPermittedVenue){
        handler(jsonData)
      }
    } else {
      handler(jsonData)
    }
  }

  onActivity(onActivityChangedEvent)

  await cacheEntryRemoved

  offActivity(onActivityChangedEvent)
}
