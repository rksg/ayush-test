export function resolveTenantTypeFromPath (): 't' | 'v' {
  const [, marker] = window.location.pathname.split('/').filter(Boolean)

  return marker === 'v' ? 'v' : 't'
}

export function isRecSite (): boolean {
  return resolveTenantTypeFromPath() === 't'
}
