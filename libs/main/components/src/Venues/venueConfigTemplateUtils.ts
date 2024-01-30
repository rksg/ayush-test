import {
  useGetVenueQuery,
  useGetVenueTemplateQuery
} from '@acx-ui/rc/services'
import { useConfigTemplate } from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'

export function useGetVenueInstance () {
  const { isTemplate } = useConfigTemplate()
  const { tenantId, venueId } = useParams()
  // eslint-disable-next-line max-len
  const venueResult = useGetVenueQuery({ params: { tenantId, venueId } }, { skip: !venueId || isTemplate })
  // eslint-disable-next-line max-len
  const venueTemplateResult = useGetVenueTemplateQuery({ params: { venueId } }, { skip: !venueId || !isTemplate })

  return isTemplate ? venueTemplateResult : venueResult
}
