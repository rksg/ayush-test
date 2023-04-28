import { useState, useEffect } from 'react'

import { useAuthenticateMutation }            from '@acx-ui/reports/services'
import { getHostNameForMSPDataStudio, isMSP } from '@acx-ui/utils'

export const getHostName = (origin: string) => {
  if(process.env['NODE_ENV'] === 'development')
    return 'https://dev.ruckus.cloud'

  return isMSP() ? getHostNameForMSPDataStudio(origin) : origin
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
