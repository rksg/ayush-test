
import { GoogleMap, Loader, MapProps } from '@acx-ui/components'

import { usePreference } from '../usePreference'

export function GoogleMapWithPreference (props: MapProps) {
  const {
    currentMapRegion, currentDefaultLang,
    getReqState,
    updateReqState
  } = usePreference()

  const isLoading = getReqState.isLoading || getReqState.isFetching || updateReqState.isLoading

  return (
    <Loader states={[getReqState, updateReqState]}>
      { // due to GoogleMap js script cannot be reloaded with different loader configs
        isLoading === false &&
        <GoogleMap
          loaderOpts={{
            language: currentDefaultLang,
            region: currentMapRegion
          }}
          {...props}
        />
      }
    </Loader>
  )
}
