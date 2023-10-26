import { ReactNode } from 'react'

import { useParams, Params } from 'react-router-dom'

import { useSwitchDetailsQuery } from '@acx-ui/analytics/services'
import { SwitchContext }         from '@acx-ui/rc/utils'
import { useDateFilter }         from '@acx-ui/utils'


export function SwitchContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const { startDate, endDate } = useDateFilter()

  const switchDetailsResult = useSwitchDetailsQuery({
    startDate,
    endDate,
    mac: params.switchId as string,
    path: [
      {
        type: 'network',
        name: 'Network'
      }
    ]
  })

  const values: Params<string> = { ...params,
    ...switchDetailsResult?.data as unknown as Params<string>
  }
  return <SwitchContext.Provider value={values}>
    {/* <Loader states={[results]}>{
      data && data.length
        ? props.children
        : $t({ defaultMessage: 'Could not find AP {apId}' }, params)
    }</Loader> */}
    {props.children}
  </SwitchContext.Provider>
}