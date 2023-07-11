import { useState, useEffect } from 'react'

import { IFrame }                  from '@acx-ui/components'
import { useAuthenticateMutation } from '@acx-ui/reports/services'

export const getHostName = (origin: string) => {
  if(process.env['NODE_ENV'] === 'development')
    return 'https://dev.ruckus.cloud'

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
      {url && (<IFrame
        title='data-studio'
        src={`${getHostName(window.location.origin)}${url}`}
        style={{ width: '100%', height: '85vh', border: 'none' }}
      />
      )}
    </div>
  )
}
