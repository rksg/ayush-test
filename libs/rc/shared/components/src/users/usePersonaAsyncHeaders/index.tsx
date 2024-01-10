import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'


export function usePersonaAsyncHeaders (): { customHeaders: Record<string, string> } {
  const isAsync = useIsSplitOn(Features.CLOUDPATH_ASYNC_API_TOGGLE)

  const asyncHeaders = {
    'Content-Type': 'application/vnd.ruckus.v2+json',
    'Accept': 'application/vnd.ruckus.v2+json'
  }

  return {
    customHeaders: isAsync ? asyncHeaders : {}
  }
}
