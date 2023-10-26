import { ReactNode } from 'react'

import { useParams, Params } from 'react-router-dom'

import { useApDetailsQuery } from '@acx-ui/analytics/services'
import { ApContext }         from '@acx-ui/rc/utils'
import { useDateFilter }     from '@acx-ui/utils'

export function ApContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const { startDate, endDate } = useDateFilter()

  const apDetailsResult = useApDetailsQuery({
    startDate,
    endDate,
    mac: params.apId as string
  })

  const values: Params<string> = { ...params,
    ...apDetailsResult?.data as unknown as Params<string>
  }
  return <ApContext.Provider value={values}>
    {props.children}
  </ApContext.Provider>
}