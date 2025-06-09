
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
  usePolicyPageHeaderTitle,
  usePolicyListBreadcrumb,
  usePolicyPreviousPath,
  useAfterPolicySaveRedirectPath
} from '@acx-ui/rc/utils'
import { CommonResult } from '@acx-ui/user'

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

  const { editMode=false, modalMode=false, modalCallBack } = props

  const formRef = useRef<StepsFormLegacyInstance<WifiOperatorContext>>()
  const { data } = useGetWifiOperatorQuery({ params }, { skip: !editMode })
  const [ createWifiOperator ] = useAddWifiOperatorMutation()
  const [ updateWifiOperator ] = useUpdateWifiOperatorMutation()

  const breadcrumb = usePolicyListBreadcrumb(PolicyType.WIFI_OPERATOR)
  const pageTitle = usePolicyPageHeaderTitle(editMode, PolicyType.WIFI_OPERATOR)
  const previousPath = usePolicyPreviousPath(PolicyType.WIFI_OPERATOR, PolicyOperation.LIST)
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.WIFI_OPERATOR)

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
          payload,
          callback: async (res: CommonResult) => {
            const id = res.response?.id
            formData.id = id
            if (modalMode) {
              modalCallBack?.(id)
            }
          }
        }).unwrap().then(() => {
          if (!modalMode) {
            navigate(redirectPathAfterSave, { replace: true })
          }
        })
      } else {
        await updateWifiOperator({
          params,
          payload
        }).unwrap()
        modalMode? modalCallBack?.() : navigate(redirectPathAfterSave, { replace: true })
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
      onCancel={() => modalMode ? modalCallBack?.() : navigate(previousPath)}
      onFinish={async (data) => {
        return handleWifiOperator(data)
      }}
    >
      <StepsFormLegacy.StepForm>
        <GridRow>
          <GridCol col={{ span: modalMode? 24: 10 }}>
            {!modalMode &&
              <StepsFormLegacy.Title>
                {$t({ defaultMessage: 'Settings' })}
              </StepsFormLegacy.Title>
            }
            <WifiOperatorSettingForm />
          </GridCol>
        </GridRow>
      </StepsFormLegacy.StepForm>
    </StepsFormLegacy>
  </>)
}
