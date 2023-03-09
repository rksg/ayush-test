import { useEffect, useCallback } from 'react'

import { DEFAULT_ID } from '@googlemaps/js-api-loader'

import { get }                                                 from '@acx-ui/config'
import { useIsSplitOn, Features }                              from '@acx-ui/feature-toggle'
import { useGetPreferencesQuery, useUpdatePreferenceMutation } from '@acx-ui/rc/services'
import { COUNTRY_CODE, TenantPreferenceSettings }              from '@acx-ui/rc/utils'
import { useParams }                                           from '@acx-ui/react-router-dom'

export const countryCodes = COUNTRY_CODE.map(item=> ({
  label: item.name,
  value: item.code
}))

const getMapRegion = (data: TenantPreferenceSettings | undefined): string => {
  return data?.global.mapRegion as string
}

const usePreference = () => {
  const params = useParams()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)

  const { data, ...getReqState }
    = useGetPreferencesQuery({ params })
  const [update, updateReqState] = useUpdatePreferenceMutation()

  const updateGoogleMapRegion = useCallback((regionCode: string) => {
    if (isMapEnabled && regionCode && countryCodes.some(o => o.value === regionCode)) {
      const gKey= get('GOOGLE_MAPS_KEY')
      const gMapElem = document.getElementById(DEFAULT_ID)

      // FIXME: should update loader config via @googlemaps/js-api-loader API.
      //        but it is still an open issue(https://github.com/googlemaps/js-api-loader/issues/100).
      if (gMapElem) {
        gMapElem.remove()
      }

      const script = document.createElement('script')
      script.id = DEFAULT_ID
      script.onerror = () => {
        // eslint-disable-next-line no-console
        console.log('Failed to load google maps key from env')
      }

      script.onload = () => {
        // eslint-disable-next-line no-console
        console.log('google maps key fetched successfully')
      }

      // eslint-disable-next-line max-len
      script.src = `https://maps.googleapis.com/maps/api/js?key=${gKey}&region=${regionCode}&libraries=places&language=en`
      document.head.appendChild(script)
    }
  }, [isMapEnabled])

  const currentMapRegion = getMapRegion(data)

  useEffect(() => {
    if (isMapEnabled)
      updateGoogleMapRegion(currentMapRegion)
  }, [currentMapRegion, isMapEnabled, updateGoogleMapRegion])


  return {
    currentMapRegion,
    getReqState,
    updateReqState,
    data,
    update,
    updateGoogleMapRegion
  }
}

export { usePreference }