
import {  Alert }                      from '@acx-ui/components'
import { useGetPlmMessageBannerQuery } from '@acx-ui/rbac'
import { useParams  }                  from '@acx-ui/react-router-dom'

export function CloudMessageBanner () {

  const params = useParams()

  const { data } = useGetPlmMessageBannerQuery({ params })

  return (
    data?.description ? (<Alert message={data?.description} type='info' showIcon closable />) : null
  )
}
