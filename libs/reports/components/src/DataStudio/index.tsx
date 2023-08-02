import { useState, useEffect } from 'react'

import { get }                     from '@acx-ui/config'
import { useAuthenticateMutation } from '@acx-ui/reports/services'

export const getHostName = (origin: string) => {
  if (process.env['NODE_ENV'] === 'development')
    return get('IS_MLISA_SA') ?
      'https://staging.mlisa.io'
      :
      'https://dev.ruckus.cloud'

  return origin
}

export function DataStudio () {
  const [url, setUrl] = useState<string>()
  const [ authenticate ] = useAuthenticateMutation()

  useEffect(() => {
    authenticate({}).unwrap().then(url => {
      setUrl(url)
    })
  }, [authenticate])

  return (
    <div data-testid='data-studio'>
      {url && (<iframe
        title='data-studio'
        src={`${getHostName(window.location.origin)}${url}`}
        style={{ width: '100%', height: '85vh', border: 'none' }}
      />
      )}
    </div>
  )
}
