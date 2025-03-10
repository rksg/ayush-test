import { useContext, useEffect } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Features, useIsSplitOn }                                              from '@acx-ui/feature-toggle'
import { CertificateTable, CertTemplateLink, ResourceBanner }                  from '@acx-ui/rc/components'
import { useGetCertificatesByIdentityIdQuery, useGetCertificateTemplateQuery } from '@acx-ui/rc/services'
import { Persona, PersonaGroup, useTableQuery }                                from '@acx-ui/rc/utils'

import { IdentityDetailsContext } from './index'



function CertificateTab (props: { personaData?: Persona, personaGroupData?: PersonaGroup }) {
  const { $t } = useIntl()
  const { personaId } = useParams()
  const { personaData, personaGroupData } = props

  const isCertTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)

  const { setCertCount } = useContext(IdentityDetailsContext)

  const { data: certTemplateData } = useGetCertificateTemplateQuery(
    { params: { policyId: personaGroupData?.certificateTemplateId! } },
    { skip: !personaGroupData?.certificateTemplateId || !isCertTemplateEnabled })
  const certTableQuery = useTableQuery({
    useQuery: useGetCertificatesByIdentityIdQuery,
    apiParams: {
      templateId: personaGroupData?.certificateTemplateId!,
      personaId: personaId!
    },
    defaultPayload: {},
    option:
      { skip: !isCertTemplateEnabled || !personaGroupData?.certificateTemplateId || !personaId }
  })

  useEffect(() => {
    if (!certTableQuery.isLoading && certTableQuery.data){
      setCertCount(certTableQuery.data.totalCount ?? 0)
    }
  }, [certTableQuery.isLoading])

  return(<>
    <ResourceBanner
      context={
        $t({ defaultMessage: 'Certificates have been generated from template: {source}' },
          {
            source: <CertTemplateLink
              id={personaGroupData?.certificateTemplateId}
              name={certTemplateData?.name}
              showNoData
            />
          })
      }
    />
    <CertificateTable
      showGenerateCert={!personaData?.revoked ?? false}
      templateData={certTemplateData}
      tableQuery={certTableQuery}
      specificIdentity={personaId}
    />
  </>)
}

export default CertificateTab
