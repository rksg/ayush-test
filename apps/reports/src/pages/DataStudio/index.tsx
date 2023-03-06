import { useState, useEffect } from 'react'

import { useAuthenticateMutation } from '@acx-ui/reports/services'

export function DataStudio () {
  const HOST_NAME = process.env['NODE_ENV'] === 'development'
    ? 'https://devalto.ruckuswireless.com' // Dev
    //? 'https://alto.local.mlisa.io' // Minikube
    : window.location.origin // Production


  const [url, setUrl] = useState<string>()
  const [ authenticate ] = useAuthenticateMutation()

  useEffect(() => {
    authenticate({}).unwrap().then( url => setUrl(url))
  }, [authenticate])

  return (
    <div data-testid='data-studio'>
      {url && (<iframe
        title='data-studio'
        src={HOST_NAME + url}
        style={{ width: '100%', height: '85vh', border: 'none' }}
      />
      )}
    </div>
  )
}
