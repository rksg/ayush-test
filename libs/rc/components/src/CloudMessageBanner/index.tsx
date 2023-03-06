
import {  Alert }                      from '@acx-ui/components'
import { useParams  }                  from '@acx-ui/react-router-dom'
import { useGetPlmMessageBannerQuery } from '@acx-ui/user'

export function CloudMessageBanner () {

  const params = useParams()

  const { data } = useGetPlmMessageBannerQuery({ params })

  return (
    data?.description ? (<Alert message={data?.description} type='info' showIcon closable />) : null
  )
}
