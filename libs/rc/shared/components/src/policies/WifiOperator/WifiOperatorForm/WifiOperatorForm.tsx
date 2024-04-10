
import { useEffect, useRef } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import {
  GridCol,
  GridRow,
  PageHeader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import {
  useAddWifiOperatorMutation,
  useGetWifiOperatorQuery,
  useUpdateWifiOperatorMutation
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  WifiOperatorContext,
  generatePolicyPageHeaderTitle,
  getPolicyRoutePath,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import WifiOperatorSettingForm from './WifiOperatorSettingForm'

type WifiOperatorFormProps = {
  editMode?: boolean,
  modalMode?: boolean,
  modalCallBack?: (id?: string) => void
}

export const WifiOperatorForm = (props: WifiOperatorFormProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({
    type: PolicyType.WIFI_OPERATOR,
    oper: PolicyOperation.LIST
  })
  const linkToPolicies = useTenantLink(tablePath)

  const { editMode=false, modalMode=false, modalCallBack } = props

  const formRef = useRef<StepsFormLegacyInstance<WifiOperatorContext>>()
  const { data } = useGetWifiOperatorQuery({ params }, { skip: !editMode })
  const [ createWifiOperator ] = useAddWifiOperatorMutation()
  const [ updateWifiOperator ] = useUpdateWifiOperatorMutation()

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.WIFI_OPERATOR)
  const pageTitle = generatePolicyPageHeaderTitle(editMode, false, PolicyType.WIFI_OPERATOR)

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
      if (!editMode) {
        await createWifiOperator({
          params,
          payload
        }).unwrap().then((res)=>{
          const id = res.response?.id
          formData.id = id
          modalMode? modalCallBack?.(id) : navigate(linkToPolicies, { replace: true })
        })
      } else {
        await updateWifiOperator({
          params,
          payload
        }).unwrap()
        modalMode? modalCallBack?.() : navigate(linkToPolicies, { replace: true })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (<>
    {!modalMode &&
      <PageHeader
        title={pageTitle}
        breadcrumb={breadcrumb}
      />
    }
    <StepsFormLegacy<WifiOperatorContext>
      formRef={formRef}
      editMode={editMode}
      onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToPolicies, { replace: true })}
      onFinish={async (data) => {
        return handleWifiOperator(data)
      }}
    >
      <StepsFormLegacy.StepForm>
        <GridRow>
          {!modalMode?
            <GridCol col={{ span: 10 }}>
              <StepsFormLegacy.Title>
                {$t({ defaultMessage: 'Settings' })}
              </StepsFormLegacy.Title>
              <WifiOperatorSettingForm edit={editMode}/>
            </GridCol>
            : <GridCol col={{ span: 24 }}>
              <WifiOperatorSettingForm edit={editMode}/>
            </GridCol>
          }
        </GridRow>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </>)
}