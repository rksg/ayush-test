import { useState, useEffect } from 'react'

import { IFrame }                  from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import { useAuthenticateMutation } from '@acx-ui/reports/services'
import { useUserProfileContext }   from '@acx-ui/user'

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
  const { data: userProfile } = useUserProfileContext()
  const { firstName, lastName, email } = userProfile || {}

  useEffect(() => {
    authenticate({
      payload: {
        user: {
          firstName,
          lastName,
          email
        }
      }
    }).unwrap().then(url => {
      setUrl(url)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
