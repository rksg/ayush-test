import { createContext, useContext, ReactNode } from 'react'

import { pick } from 'lodash'

import { Loader }         from '@acx-ui/components'
import { useApListQuery } from '@acx-ui/rc/services'
import { useParams }      from '@acx-ui/react-router-dom'
import type { Params }    from '@acx-ui/react-router-dom'

const ApContext = createContext({} as Params<string>)

export function useApContext () {
  return useContext(ApContext)
}

export function ApContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const results = useApListQuery({
    params,
    payload: {
      fields: ['serialNumber', 'venueName', 'apMac'],
      searchTargetFields: ['apMac', 'serialNumber'],
      searchString: params.apId
    }
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })
  const { data } = results
  const values: Params<string> = {
    ...params,
    ...pick(data?.[0], ['venueName', 'apMac', 'serialNumber']) as Params<string>
  }
  return <ApContext.Provider value={values}>
    <Loader states={[results]}>{
      data && data.length
        ? props.children
        : `Could not find AP ${params.apId}`
    }</Loader>
  </ApContext.Provider>
}
