import { useState, useEffect } from 'react'

import { getUserProfile as getUserProfileRA } from '@acx-ui/analytics/utils'
import { IFrame }                             from '@acx-ui/components'
import { get }                                from '@acx-ui/config'
import { useAuthenticateMutation }            from '@acx-ui/reports/services'
import { getUserProfile as getUserProfileR1 } from '@acx-ui/user'

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
  const { firstName, lastName, email } = get('IS_MLISA_SA')
    ? getUserProfileRA()
    : getUserProfileR1().profile

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
  }, [authenticate, email, firstName, lastName])

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
