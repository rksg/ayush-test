import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, PageHeader }                 from '@acx-ui/components'
import { useEdgeSdLanActions }                from '@acx-ui/edge/components'
import { useGetEdgeMvSdLanViewDataListQuery } from '@acx-ui/rc/services'
import {
  EdgeSdLanServiceProfile,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanFormContainer, EdgeSdLanFormType } from '../Form'
import { GeneralForm }                               from '../Form/GeneralForm'
import { NetworkSelectionForm }                      from '../Form/NetworkSelectionForm'
import { transformToFormData }                       from '../Form/utils'

export const EditEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const [form] = Form.useForm()
  const cfListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(cfListRoute)
  const { updateEdgeSdLan } = useEdgeSdLanActions()
  const { data, isLoading, isFetching } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'name', 'tunnelProfileId', 'tunneledWlans'],
      filters: { id: [params.serviceId] }
    } }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: transformToFormData(data?.data?.[0]),
      ...rest
    })
  })

  const steps = [
    {
      title: $t({ defaultMessage: 'General' }),
      content: GeneralForm
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Network Selection' }),
      content: NetworkSelectionForm
    }
  ]

  const handleFinish = async (formData: EdgeSdLanFormType) => {
    try {
      const payload = {
        name: formData.name,
        tunnelProfileId: formData.tunnelProfileId,
        activeNetwork: Object.entries(formData.activatedNetworks)
          .map(([venueId, networks]) => networks.map(({ networkId, tunnelProfileId }) => ({
            venueId,
            networkId,
            tunnelProfileId
          }))).flat()
      }

      await new Promise(async (resolve, reject) => {
        await updateEdgeSdLan(data as unknown as EdgeSdLanServiceProfile, {
          payload,
          callback: (result) => {
            // callback is after all RBAC related APIs sent
            if (Array.isArray(result)) {
              resolve(true)
              navigate(linkToServiceList, { replace: true })
            } else {
              reject(result)
            }
          }
          // need to catch basic service profile failed
        }).catch(reject)
      })
    } catch(err) {
      // eslint-disable-next-line no-console
      console.log(err)
      navigate(linkToServiceList, { replace: true })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit SD-LAN' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'SD-LAN' }), link: cfListRoute }
        ]}
      />
      <Loader states={[{ isLoading, isFetching }]}>
        <EdgeSdLanFormContainer
          form={form}
          steps={steps}
          onFinish={handleFinish}
          editData={data}
        />
      </Loader>
    </>
  )
}
