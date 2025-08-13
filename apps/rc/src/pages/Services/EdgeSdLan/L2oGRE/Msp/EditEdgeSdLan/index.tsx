import { Form }    from 'antd'
import { omit }    from 'lodash'
import { useIntl } from 'react-intl'

import { Loader, PageHeader }                                                                               from '@acx-ui/components'
import { useEdgeSdLanActions }                                                                              from '@acx-ui/edge/components'
import { useGetEdgeMvSdLanViewDataListQuery }                                                               from '@acx-ui/rc/services'
import { getServiceRoutePath, isEdgeWlanTemplate, ServiceOperation, ServiceType, useServiceListBreadcrumb } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                            from '@acx-ui/react-router-dom'

import { EdgeSdLanFormType }                       from '../../Form'
import { transformToApiData, transformToFormData } from '../../shared/utils'
import { MspEdgeSdLanFormContainer }               from '../Form'
import { CustomerSelectionForm }                   from '../Form/CustomerSelectionForm'
import { GeneralForm }                             from '../Form/GeneralForm'
import { NetworkSelectionForm }                    from '../Form/NetworkSelectionForm'



export const EditEdgeSdLan = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const [form] = Form.useForm()
  const sdLanListRoute = getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  })
  const linkToServiceList = useTenantLink(sdLanListRoute)
  const { updateEdgeSdLan } = useEdgeSdLanActions()

  const { data, isLoading, isFetching } = useGetEdgeMvSdLanViewDataListQuery({
    payload: {
      fields: ['id', 'name', 'tunnelProfileId', 'tunnelTemplateId', 'tunneledWlans'],
      filters: { id: [params.serviceId] }
    } }, {
    selectFromResult: ({ data, ...rest }) => {
      const currentSdLanData = data?.data?.[0]
      const processedData = {
        ...currentSdLanData,
        tunneledWlanTemplates: currentSdLanData?.tunneledWlans
          ?.filter(w => isEdgeWlanTemplate(w.wlanId)),
        tunneledWlans: currentSdLanData?.tunneledWlans
          ?.filter(w => !isEdgeWlanTemplate(w.wlanId))
      }
      return {
        ...rest,
        data: transformToFormData(processedData)
      }
    }
  })

  const steps = [
    {
      title: $t({ defaultMessage: 'General' }),
      content: GeneralForm
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Network Selection' }),
      content: NetworkSelectionForm
    },
    ...(!!data.tunnelTemplateId ? [
      {
        title: $t({ defaultMessage: 'Select Customers' }),
        content: CustomerSelectionForm
      }
    ] : [])
  ]

  const handleFinish = async (formData: EdgeSdLanFormType) => {
    try{
      const payload = omit(transformToApiData(formData), 'id')

      await new Promise(async (resolve, reject) => {
        await updateEdgeSdLan(
          transformToApiData(data),
          {
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
          },
          true
          // need to catch basic service profile failed
        ).catch(reject)
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
        breadcrumb={useServiceListBreadcrumb(ServiceType.EDGE_SD_LAN)}
      />
      <Loader states={[{ isLoading, isFetching }]}>
        <MspEdgeSdLanFormContainer
          form={form}
          steps={steps}
          onFinish={handleFinish}
          editData={data}
        />
      </Loader>
    </>
  )
}