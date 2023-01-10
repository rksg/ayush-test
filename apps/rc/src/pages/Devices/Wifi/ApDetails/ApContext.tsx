import { createContext, useContext, ReactNode } from 'react'

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
  const [{ venueName, apMac, serialNumber }] = results.data ?? [{}]
  const values: Params<string> = { ...params, venueName, apMac, serialNumber }
  return <ApContext.Provider value={values}>
    <Loader states={[results]}>{serialNumber ? props.children : null}</Loader>
  </ApContext.Provider>
}
