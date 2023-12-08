import { useRef, useEffect, useState, useMemo } from 'react'

import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { useAddAAAPolicyTemplateMutation }                                        from '@acx-ui/msp/services'
import { useAaaPolicyQuery, useAddAAAPolicyMutation, useUpdateAAAPolicyMutation } from '@acx-ui/rc/services'
import {
  AAAPolicyType,
  CONFIG_TEMPLATE_LIST_PATH,
  generateConfigTemplateBreadcrumb,
  generatePolicyPageHeaderTitle,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  policyTypeLabelMapping,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import AAASettingForm from './AAASettingForm'


type AAAFormProps = {
  type?: string,
  edit: boolean,
  networkView?: boolean,
  backToNetwork?: (value?: AAAPolicyType) => void
}
const AAAForm = (props: AAAFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToInstanceList = useInstanceListPath()
  const params = useParams()
  const { type, edit, networkView, backToNetwork } = props
  const isEdit = edit && !networkView
  const formRef = useRef<StepsFormLegacyInstance<AAAPolicyType>>()
  const { data } = useAaaPolicyQuery({ params }, { skip: !isEdit })
  const { isTemplate } = useConfigTemplate()
  const createAAAPolicy = useAddInstance()
  const breadcrumb = useBreadcrumb()

  const [ updateAAAPolicy ] = useUpdateAAAPolicyMutation()
  const [saveState, updateSaveState] = useState<AAAPolicyType>({ name: '' })
  const updateSaveData = (saveData: Partial<AAAPolicyType>) => {
    updateSaveState({ ...saveState, ...saveData })
  }

  useEffect(() => {
    if (data) {
      formRef?.current?.resetFields()
      formRef?.current?.setFieldsValue(data)
      updateSaveData(data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleAAAPolicy = async (data: AAAPolicyType) => {
    const requestPayload = { params, payload: data }
    try {
      if (isEdit) {
        await updateAAAPolicy(requestPayload).unwrap()
      } else {
        await createAAAPolicy(requestPayload).unwrap().then(res => data.id = res?.response?.id)
      }
      networkView ? backToNetwork?.(data) : navigate(linkToInstanceList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onCancel = () => {
    networkView ? backToNetwork?.() : navigate(linkToInstanceList)
  }

  return (
    <>
      {!networkView && <PageHeader
        title={generatePolicyPageHeaderTitle(isEdit, isTemplate, PolicyType.AAA)}
        breadcrumb={breadcrumb}
      />}
      <StepsFormLegacy<AAAPolicyType>
        formRef={formRef}
        onCancel={onCancel}
        onFinish={handleAAAPolicy}
      >
        <StepsFormLegacy.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
        >
          <AAASettingForm edit={isEdit}
            saveState={saveState}
            type={type}
            networkView={networkView}/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
export default AAAForm

function useAddInstance () {
  const { isTemplate } = useConfigTemplate()
  const [ createAAAPolicy ] = useAddAAAPolicyMutation()
  const [ createAAAPolicyTemplate ] = useAddAAAPolicyTemplateMutation()

  return isTemplate ? createAAAPolicyTemplate : createAAAPolicy
}

function useBreadcrumb () {
  const { isTemplate } = useConfigTemplate()
  const tablePath = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })
  const { $t } = useIntl()
  const breadcrumb = useMemo(() => {
    return isTemplate
      ? generateConfigTemplateBreadcrumb()
      : [
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        },
        { text: $t(policyTypeLabelMapping[PolicyType.AAA]), link: tablePath }
      ]
  }, [isTemplate])

  return breadcrumb
}

function useInstanceListPath () {
  const { isTemplate } = useConfigTemplate()
  const aaaTablePath = getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })

  // eslint-disable-next-line max-len
  return useTenantLink(isTemplate ? CONFIG_TEMPLATE_LIST_PATH : aaaTablePath, isTemplate ? 'v' : 't')
}
