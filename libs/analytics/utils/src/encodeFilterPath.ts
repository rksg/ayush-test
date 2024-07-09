import { fixedEncodeURIComponent, NetworkPath } from '@acx-ui/utils'

export function encodeFilterPath (type: 'report' | 'analytics', path: NetworkPath): string {
  const target = type === 'report' ? 'reportsNetworkFilter' : 'analyticsNetworkFilter'
  const encodedPath = fixedEncodeURIComponent(JSON.stringify({ raw: path, path }))
  return `${target}=${encodedPath}`
}
