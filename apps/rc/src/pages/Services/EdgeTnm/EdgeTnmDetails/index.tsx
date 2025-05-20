
import { find } from 'lodash'

import { PageHeader }                    from '@acx-ui/components'
import { useGetEdgeTnmServiceListQuery } from '@acx-ui/rc/services'
import {
  ServiceType,
  useServiceListBreadcrumb
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { EdgeTnmHostTable } from './EdgeTnmHostTable'

export const EdgeTnmDetails = () => {
  const { serviceId } = useParams()

  const { data } = useGetEdgeTnmServiceListQuery({}, {
    selectFromResult: ({ data }) => {
      return {
        data: find(data, { id: serviceId })
      }
    }
  })

  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={useServiceListBreadcrumb(ServiceType.EDGE_TNM_SERVICE)}
      />
      <EdgeTnmHostTable serviceId={serviceId} />
    </>
  )
}
