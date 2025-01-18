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
      const hasPermittedVenue = jsonData?.scopeType === 'venues' && jsonData?.scopeIds?.some(
        (id: string) => userProfile.venuesList?.includes(id))
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
