import { useNavigate } from 'react-router-dom'

import { useTenantLink } from './useTenantLink'

export function useNavigateToPath (
  path: string
) {
  const navigate = useNavigate()
  const basePath = useTenantLink(path)

  return () => navigate({
    ...basePath,
    pathname: basePath.pathname
  })
}
