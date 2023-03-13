import { DEFAULT_ID } from '@googlemaps/js-api-loader'

import { get }                    from '@acx-ui/config'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'

import { countryCodes } from '.'

export const useUpdateGoogleMapRegion = () => {
  const isMapEnabled = useIsSplitOn(Features.G_MAP)

  const update = (regionCode: string): boolean => {
    if (!isMapEnabled) return false

    if (regionCode && countryCodes.some(o => o.value === regionCode)) {
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
      return true
    }

    return false
  }

  return { update }
}