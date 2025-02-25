import { useContext, useEffect } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Alert, Button }                                                                    from '@acx-ui/components'
import { DpskPassphraseManagement, DpskPoolLink, ResourceBanner }                           from '@acx-ui/rc/components'
import { useGetDpskQuery, useGetEnhancedDpskPassphraseListQuery, useUpdatePersonaMutation } from '@acx-ui/rc/services'
import { Persona, PersonaGroup, useTableQuery }                                             from '@acx-ui/rc/utils'

import { IdentityDetailsContext } from './index'


const dpskDefaultSorter = {
  sortField: 'createdDate',
  sortOrder: 'DESC'
}

function DpskPassphraseTab (props : { personaData?: Persona, personaGroupData?: PersonaGroup }) {
  const { $t } = useIntl()
  const { personaData, personaGroupData } = props
  const { setDpskCount } = useContext(IdentityDetailsContext)

  const [ updatePersona ] = useUpdatePersonaMutation()

  const { data: dpskPoolData } = useGetDpskQuery(
    { params: { serviceId: personaGroupData?.dpskPoolId } },
    { skip: !personaGroupData?.dpskPoolId }
  )
  const dpskTableQuery = useTableQuery({
    useQuery: useGetEnhancedDpskPassphraseListQuery,
    defaultPayload: {},
    search: {
      searchTargetFields: ['id'],
      searchString: personaData?.dpskGuid ?? '--'
    },
    sorter: dpskDefaultSorter,
    enableSelectAllPagesData: ['id'],
    pagination: { settingsId: 'identity-dpskpasshphrase-table' },
    apiParams: { serviceId: personaGroupData?.dpskPoolId ?? '' },
    option: {
      skip: !personaGroupData?.dpskPoolId || !personaData?.dpskGuid
    }
  })

  useEffect(() => {
    if (!dpskTableQuery.isLoading && dpskTableQuery.data) {
      setDpskCount(dpskTableQuery.data?.totalCount ?? 0)
    }
  }, [dpskTableQuery.isLoading])

  useEffect(() => {
    // For regenerate dpsk to refresh
    if (personaData?.dpskGuid) {
      dpskTableQuery.setPayload({
        ...dpskTableQuery.payload,
        searchTargetFields: ['id'],
        searchString: personaData?.dpskGuid
      })
    }
  }, [personaData?.dpskGuid])

  const regeneratePassphrase = async () => {
    return await updatePersona({
      params: { groupId: personaData?.groupId, id: personaData?.id },
      payload: { dpskPassphrase: null }
    })
  }

  return (<>
    {!personaData?.dpskGuid
      && <Alert
        type={'warning'}
        // eslint-disable-next-line max-len
        message={$t({ defaultMessage: 'Your passphrase has been deleted, please click {here} to regenerate a new passphrase.' },
          // eslint-disable-next-line max-len
          { here: <Button size={'small'} type={'link'} onClick={regeneratePassphrase}>{$t({ defaultMessage: 'here' })}</Button> })}
      />
    }

    {personaGroupData?.dpskPoolId &&
      <>
        <ResourceBanner
          context={<Typography>
            {/*eslint-disable-next-line max-len*/}
            {$t({ defaultMessage: 'DPSK Passphrases have been generated from service: {source}' },
              { source: <DpskPoolLink
                showNoData
                dpskPoolId={personaGroupData.dpskPoolId}
                name={dpskPoolData?.name}
              /> })}
          </Typography>}
        />
        <DpskPassphraseManagement
          serviceId={personaGroupData.dpskPoolId}
          tableQuery={dpskTableQuery}
          disableAddNetwork
          disableCreate
          disableImport
          disableExport
          disableSearchable
        />
      </>
    }
  </>)

}

export default DpskPassphraseTab
