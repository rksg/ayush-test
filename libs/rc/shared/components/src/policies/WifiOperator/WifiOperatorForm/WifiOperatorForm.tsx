
import { useEffect, useRef } from 'react'

import * as reactRouterDom from 'react-router-dom'

import { PageHeader, StepsFormLegacy, StepsFormLegacyInstance }                                                                         from '@acx-ui/components'
import { useAddWifiOperatorMutation, useGetWifiOperatorQuery, useUpdateWifiOperatorMutation }                                           from '@acx-ui/rc/services'
import { PolicyOperation, PolicyType, WifiOperatorContext, generatePolicyPageHeaderTitle, getPolicyRoutePath, usePolicyListBreadcrumb } from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                                                from '@acx-ui/react-router-dom'

import WifiOperatorSettingForm from './WifiOperatorSettingForm'

type WifiOperatorFormProps = {
  edit: boolean
}

export const WifiOperatorForm = (props: WifiOperatorFormProps) => {

  const navigate = reactRouterDom.useNavigate()
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.LIST })
  const linkToPolicies = useTenantLink(tablePath)
  const params = reactRouterDom.useParams()
  const isEdit = props.edit
  const formRef = useRef<StepsFormLegacyInstance<WifiOperatorContext>>()
  const { data } = useGetWifiOperatorQuery({ params }, { skip: !isEdit })
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.WIFI_OPERATOR)

  const [ createWifiOperator ] = useAddWifiOperatorMutation()

  const [ updateWifiOperator ] = useUpdateWifiOperatorMutation()

  useEffect(() => {
    if (data) {
      const context = { ...data, domainNames: data.domainNames.join('\n') }
      formRef?.current?.setFieldsValue(context)
    }
  }, [data])

  const handleWifiOperator = async (formData: WifiOperatorContext) => {
    try {
      const payload = { ...formData,
        domainNames: formData.domainNames.split(/\r?\n/)
      }
      if (!isEdit) {
        await createWifiOperator({
          params,
          payload
        }).unwrap().then((res)=>{
          formData.id = res.response?.id
        })
      } else {
        await updateWifiOperator({
          params,
          payload
        }).unwrap()
      }
      navigate(linkToPolicies, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={generatePolicyPageHeaderTitle(isEdit, false, PolicyType.WIFI_OPERATOR)}
        breadcrumb={breadcrumb}
      />
      <StepsFormLegacy<WifiOperatorContext>
        formRef={formRef}
        editMode={isEdit}
        onCancel={() => navigate(linkToPolicies)}
        onFinish={async (data) => {
          return handleWifiOperator(data)
        }}
      >
        <StepsFormLegacy.StepForm>
          <WifiOperatorSettingForm edit={isEdit}/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}