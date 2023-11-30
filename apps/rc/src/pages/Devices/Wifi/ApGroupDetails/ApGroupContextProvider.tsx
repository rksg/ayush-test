import { ReactNode, createContext, useContext } from 'react'

import { pick }      from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader }               from '@acx-ui/components'
import { useApGroupsListQuery } from '@acx-ui/rc/services'
import { ApGroupViewModel }     from '@acx-ui/rc/utils'


export interface ApGroupContextType extends ApGroupViewModel {
  tenantId: string
  apGroupId?: string
  activeTab?: string
}

export const ApGroupContext = createContext({} as ApGroupContextType)

export function useApGroupContext () {
  return useContext(ApGroupContext)
}

export function ApGroupContextProvider (props: { children: ReactNode }) {
  const params = useParams()
  const { tenantId, apGroupId } = params
  const { $t } = useIntl()
  const fields = ['id', 'name', 'venueName', 'venueId', 'members', 'networks']
  const results = useApGroupsListQuery({
    params: { tenantId },
    payload: {
      fields,
      searchTargetFields: ['id'],
      searchString: apGroupId
    },
    page: 1,
    pageSize: 10
  }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: data?.data,
      ...rest
    })
  })

  const { data } = results
  const values: ApGroupContextType = {
    ...params,
    ...pick(data?.[0], fields)
  } as ApGroupContextType

  return <ApGroupContext.Provider value={values}>
    <Loader states={[results]}>{
      data && data.length
        ? props.children
        : $t({ defaultMessage: 'Could not find AP group {apGroupId}' }, { apGroupId })
    }</Loader>
  </ApGroupContext.Provider>
}