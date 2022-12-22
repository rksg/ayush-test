import { useEffect, useState } from 'react'

import {  Alert }                      from '@acx-ui/components'
import { useGetPlmMessageBannerQuery } from '@acx-ui/rc/services'
import { useParams  }                  from '@acx-ui/react-router-dom'

export function CloudMessageBanner () {

  const params = useParams()
  const [showMessage, setMessageFlag] = useState(false)

  const { data } = useGetPlmMessageBannerQuery({ params })
  useEffect(() => {
    if (data && data.description) {
      if (data?.description) setMessageFlag(true)
    }
  }, [data])

  return (
    showMessage ? (<Alert message={data?.description} type='info' showIcon closable />) : null
  )
}
