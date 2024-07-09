import { ReactNode } from 'react'

import { useIntl }           from 'react-intl'
import { useParams, Params } from 'react-router-dom'

import { useSwitchDetailsQuery } from '@acx-ui/analytics/services'
import { Loader }                from '@acx-ui/components'
import { SwitchContext }         from '@acx-ui/rc/utils'
import { useDateFilter }         from '@acx-ui/utils'


export function SwitchContextProvider (props: { children: ReactNode }) {
  const { $t } = useIntl()
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

  const { data } = switchDetailsResult
  return <SwitchContext.Provider value={values}>
    <Loader states={[switchDetailsResult]}>{
      data && data?.networkPath
        ? props.children
        : $t({ defaultMessage: 'Could not find Switch {switchId}' }, params)
    }</Loader>
  </SwitchContext.Provider>
}