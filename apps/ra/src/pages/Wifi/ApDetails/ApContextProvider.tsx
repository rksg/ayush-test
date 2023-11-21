import { ReactNode } from 'react'

import { useIntl }           from 'react-intl'
import { useParams, Params } from 'react-router-dom'

import { useApDetailsQuery } from '@acx-ui/analytics/services'
import { Loader }            from '@acx-ui/components'
import { ApContext }         from '@acx-ui/rc/utils'
import { useDateFilter }     from '@acx-ui/utils'

export function ApContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const { $t } = useIntl()
  const { startDate, endDate } = useDateFilter()

  const apDetailsResult = useApDetailsQuery({
    startDate,
    endDate,
    mac: params.apId as string
  })
  const { data } = apDetailsResult

  const values: Params<string> = { ...params,
    ...apDetailsResult?.data as unknown as Params<string>
  }
  return <ApContext.Provider value={values}>
    <Loader states={[apDetailsResult]}>{
      data && data?.networkPath
        ? props.children
        : $t({ defaultMessage: 'Could not find AP {apId}' }, params)
    }</Loader>
  </ApContext.Provider>
}