import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import {
  useGetPersonaGroupByIdQuery,
  useLazyGetCertificatesByIdentityIdQuery,
  useLazyGetDpskPassphraseDevicesQuery,
  useSearchPersonaListQuery,
  useLazySearchIdentityClientsQuery
} from '@acx-ui/rc/services'
import { Certificate, DPSKDeviceInfo, Persona, TableResult, useTableQuery } from '@acx-ui/rc/utils'


interface UsePersonaListQueryProps {
  personaGroupId?: string
  settingsId?: string
}

export const useIdentityListQuery = (props: UsePersonaListQueryProps) => {
  const { personaGroupId, settingsId } = props
  const { tenantId } = useParams()
  const isClientEnabled = useIsSplitOn(Features.IDENTITY_UI_REFACTOR)

  const [dataSource, setDataSource] = useState<Persona[]>([])
  const [deviceCountMap, setDeviceCountMap] = useState<{ [key: string]: number }>({})
  const [certCountMap, setCertCountMap] = useState<{ [key: string]: number }>({})
  const [ clientCountMap, setClientCountMap ] = useState(new Map())

  const personaGroupQuery = useGetPersonaGroupByIdQuery(
    { params: { groupId: personaGroupId } },
    { skip: !personaGroupId }
  )
  const personaListTableQuery = useTableQuery({
    useQuery: useSearchPersonaListQuery,
    defaultPayload: {
      keyword: '',
      groupId: personaGroupId
    },
    pagination: { settingsId }
  })
  const [getDpskDevices] = useLazyGetDpskPassphraseDevicesQuery()
  const [ getCertificates ] = useLazyGetCertificatesByIdentityIdQuery()
  const [ getIdentityClients ] = useLazySearchIdentityClientsQuery()
  const { data, ...rest } = personaListTableQuery

  useEffect(() => {
    if(!personaGroupId || personaListTableQuery.payload.groupId) return
    personaListTableQuery.setPayload({
      keyword: '',
      groupId: personaGroupId
    })
  }, [personaGroupId])

  useEffect(() => {
    if (!personaGroupQuery.data || !personaListTableQuery.data) return
    if (personaListTableQuery.isLoading || personaListTableQuery.isFetching) return

    setDataSource(personaListTableQuery.data?.data ?? [])

    const serviceId = personaGroupQuery.data?.dpskPoolId
    const templateId = personaGroupQuery.data?.certificateTemplateId

    const requests = [] as Promise<unknown>[]
    const certRequests = [] as Promise<unknown>[]

    personaListTableQuery?.data.data.forEach(persona => {
      if (templateId) {
        certRequests.push(getCertificates({
          params: {
            templateId,
            personaId: persona.id
          },
          payload: {}
        }))
      }

      const passphraseId = persona.dpskGuid
      if (!serviceId || !passphraseId || isClientEnabled) return
      requests.push(getDpskDevices({
        params: { tenantId, passphraseId, serviceId }
      }))
    })

    if (isClientEnabled) {
      const identityIds = personaListTableQuery?.data?.data?.map(persona => persona.id)

      if (identityIds.length !== 0) {
        getIdentityClients({
          payload: {
            identityIds,
            sortField: 'identityId',
            sortOrder: 'ASC',
            pageSize: 100000
          }
        }).unwrap()
          .then(result => {
            setClientCountMap(result?.data?.reduce((map, item) => {
              const key = item.identityId
              map.set(key, (map.get(key) || 0) + 1)
              return map
            }, new Map()))
          })
      }
    } else {
      Promise.all(requests).then((res) => {
        const dpskDeviceCounts = res.reduce((acc: { [key: string]: number }, cur) => {
          const item = (cur as { data: DPSKDeviceInfo[] }).data
          if(!item || item.length === 0) return acc
          const count = item.filter(d => d.deviceConnectivity === 'CONNECTED').length
          acc[item[0].devicePassphrase] = count
          return acc
        }, {}) as { [key: string]: number }

        setDeviceCountMap(dpskDeviceCounts)
      })
    }

    Promise.all(certRequests).then((res) => {
      const certCount = res.reduce((acc: { [key: string]: number }, cur) => {
        const allCertResult = (cur as { data: TableResult<Certificate> }).data
        const { data, totalCount } = allCertResult
        if (!data[0]?.identityId) return acc
        acc[data[0].identityId] = totalCount

        return acc
      }, {}) as { [key:string]: number }

      setCertCountMap(certCount)
    })

  }, [
    personaListTableQuery.isLoading,
    personaListTableQuery.isFetching,
    personaGroupQuery.isLoading
  ]
  )

  useEffect(() => {
    const result = personaListTableQuery.data?.data.map(p => ({
      ...p,
      deviceCount: isClientEnabled
        ? clientCountMap?.get(p.id) ?? 0
        : (p.deviceCount ?? 0) + (deviceCountMap[p.dpskGuid ?? ''] ?? 0),
      certificateCount: certCountMap[p.id] ?? 0
    }))

    setDataSource(result ?? [] as Persona[])
  }, [deviceCountMap, certCountMap, clientCountMap, personaListTableQuery.data?.data])

  return {
    data: dataSource.length === 0
      ? data
      : {
        ...data,
        data: dataSource
      },
    ...rest
  }
}
