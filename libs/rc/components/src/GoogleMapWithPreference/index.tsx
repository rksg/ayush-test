
import { GoogleMap, Loader, MapProps } from '@acx-ui/components'

import { usePreference } from '../usePreference'

export function GoogleMapWithPreference (props: MapProps) {
  const {
    currentMapRegion,
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
            language: 'en',
            region: currentMapRegion
          }}
          {...props}
        />
      }
    </Loader>
  )
}
