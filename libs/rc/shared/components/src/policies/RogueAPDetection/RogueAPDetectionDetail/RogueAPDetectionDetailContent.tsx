import { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Loader, SummaryCard }                                 from '@acx-ui/components'
import { useGetRoguePolicyTemplateQuery, useRoguePolicyQuery } from '@acx-ui/rc/services'
import { useConfigTemplateQueryFnSwitcher }                    from '@acx-ui/rc/utils'

import { RogueAPDetailContext } from './RogueAPDetectionDetailView'

const RogueAPDetectionDetailContent = () => {
  const { $t } = useIntl()

  const { data, isLoading } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useRoguePolicyQuery,
    useTemplateQueryFn: useGetRoguePolicyTemplateQuery
  })

  const { setFiltersId, setPolicyName } = useContext(RogueAPDetailContext)

  useEffect(() => {
    if (data){
      const filtersIdList = data.venues?.map(venue => venue.id) ?? ['UNDEFINED']
      setFiltersId(filtersIdList)
      setPolicyName(data.name ?? '')
    }
  }, [data])

  const rogueAPInfo = [
    {
      title: $t({ defaultMessage: 'Description' }),
      content: data?.description
    },
    {
      title: $t({ defaultMessage: 'Classification Rules' }),
      content: data?.rules.length
    }
  ]

  return <Loader states={[{ isLoading }]}>
    <SummaryCard data={rogueAPInfo} />
  </Loader>
}

export default RogueAPDetectionDetailContent
