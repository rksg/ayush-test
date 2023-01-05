import { useMemo } from 'react'

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RadioBand }    from '@acx-ui/components'
import {
  DateFilter,
  NetworkPath,
  useDateFilter,
  useEncodedParameter
} from '@acx-ui/utils'

const defaultNetworkPath: NetworkPath = [{ type: 'network', name: 'Network' }]

export type ReportsFilter = DateFilter & { paths: NetworkPath[], bands: RadioBand[] }

type ReportsNetworkFilter = { paths: NetworkPath[], bands: RadioBand[], raw: object }

export function useReportsFilter () {
  const { read, write } = useEncodedParameter<ReportsNetworkFilter>('reportsNetworkFilter')
  const { dateFilter } = useDateFilter()

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
        ...dateFilter,
        ...networkFilter
      } as ReportsFilter,
      setNetworkPath,
      getNetworkFilter,
      raw
    }
  }, [dateFilter, read, write])
}
