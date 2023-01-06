import { useMemo } from 'react'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RadioBand }    from '@acx-ui/components'
import {
  NetworkPath,
  useEncodedParameter
} from '@acx-ui/utils'

const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type ReportsFilter = { paths: NetworkPath[], bands: RadioBand[] }

type ReportsNetworkFilter = { paths: NetworkPath[], bands: RadioBand[], raw: object }

export function useReportsFilter () {
  const { read, write } = useEncodedParameter<ReportsNetworkFilter>('reportsNetworkFilter')

  return useMemo(() => {
    const getNetworkFilter = () => {
      let networkFilter = read() || { paths: [defaultNetworkPath], bands: [], raw: [] }
      const { paths, bands, raw } = networkFilter
      return { networkFilter: { paths, bands }, raw }
    }

    const setNetworkPath = (paths: NetworkPath[], bands: RadioBand[], raw: object) => {
      write({ paths, bands, raw })
    }

    const { networkFilter, raw } = getNetworkFilter()
    return {
      filters: {
        ...networkFilter
      } as ReportsFilter,
      setNetworkPath,
      getNetworkFilter,
      raw
    }
  }, [read, write])
}
