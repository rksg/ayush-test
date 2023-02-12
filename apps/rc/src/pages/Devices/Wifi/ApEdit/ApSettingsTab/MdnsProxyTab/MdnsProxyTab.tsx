import { useContext, useEffect, useRef, useState } from 'react'

import {
  Form,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import {
  GridCol,
  GridRow,
  Loader,
  showToast,
  StepsForm,
  StepsFormInstance
} from '@acx-ui/components'
import { MdnsProxySelector }                                         from '@acx-ui/rc/components'
import { useGetApQuery }                                             from '@acx-ui/rc/services'
import { useAddMdnsProxyApsMutation, useDeleteMdnsProxyApsMutation } from '@acx-ui/rc/services'
import { catchErrorResponse }                                        from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                     from '@acx-ui/react-router-dom'

import { ApEditContext } from '../..'

import * as UI from './styledComponents'

const MdnsProxyTabFormField = styled((props: { className?: string, serviceId?: string }) => {
  const form = Form.useFormInstance()
  const serviceEnabled = Form.useWatch<boolean>('serviceEnabled', form)
  const { $t } = useIntl()
  const { className, serviceId } = props

  return (
    <div className={className}>
      <Form.Item
        name='serviceEnabled'
        label={$t({ defaultMessage: 'Activate Service' })}
        valuePropName='checked'
        initialValue={!!serviceId}
      >
        <Switch />
      </Form.Item>
      {serviceEnabled &&
        <MdnsProxySelector
          formItemProps={{
            name: 'serviceId',
            rules: [{ required: true }],
            initialValue: serviceId,
            className: 'vertical-form-item'
          }}
        />
      }
    </div>
  )
})`${UI.styles}`

interface MdnsProxyTabFormFieldType {
  serviceEnabled: boolean
  serviceId?: string
}

export function MdnsProxyTab () {
  const formRef = useRef<StepsFormInstance<MdnsProxyTabFormFieldType>>()
  const { $t } = useIntl()
  const params = useParams()
  const { serialNumber } = params
  const navigate = useNavigate()
  const [ isFormChangedHandled, setIsFormChangedHandled ] = useState(true)
  const wifiDetailPath = useTenantLink(`/devices/wifi/${serialNumber}/details/overview`)
  const { editContextData, setEditContextData } = useContext(ApEditContext)
  const {
    data: apDetail,
    isFetching: isDataFetching,
    isLoading,
    isSuccess,
    refetch
  } = useGetApQuery({ params })

  const [ addMdnsProxyAps, { isLoading: isUpdating } ] = useAddMdnsProxyApsMutation()
  const [ deleteMdnsProxyAps, { isLoading: isDeleting } ] = useDeleteMdnsProxyApsMutation()

  useEffect(() => {
    if (!isFormChangedHandled) {
      handleFormChange()
      setIsFormChangedHandled(true)
    }
  }, [isFormChangedHandled])

  const isServiceChanged = (serviceId?: string): boolean => {
    return serviceId !== apDetail?.multicastDnsProxyServiceProfileId
  }

  const isServiceActivationChanged = (serviceEnabled: boolean): boolean => {
    return !serviceEnabled && !!apDetail?.multicastDnsProxyServiceProfileId
  }

  const isFormInvalid = () => {
    const isValid = formRef.current
      ? formRef.current.getFieldsError().map(item => item.errors).flat().length > 0
      : false
    return isValid
  }

  const updateEditContextData = (dataChanged: boolean) => {
    setEditContextData({
      tabTitle: dataChanged ? $t({ defaultMessage: 'mDNS Proxy' }) : '',
      isDirty: dataChanged,
      hasError: dataChanged ? isFormInvalid() : editContextData.hasError,
      updateChanges: () => {
        dataChanged && onSave(formRef.current!.getFieldsValue())
      },
      discardChanges: () => {
        dataChanged && formRef.current!.resetFields()
      }
    })
  }

  const handleFormChange = () => {
    const formData = formRef.current!.getFieldsValue()
    // eslint-disable-next-line max-len
    const dataChanged = isServiceChanged(formData.serviceId) || isServiceActivationChanged(formData.serviceEnabled)

    updateEditContextData(dataChanged)
  }

  const resetForm = () => {
    refetch()
    updateEditContextData(false)
  }

  const onSave = async (formData: MdnsProxyTabFormFieldType) => {
    const originalServiceId = apDetail?.multicastDnsProxyServiceProfileId

    try {
      if (formData.serviceEnabled) {
        await addMdnsProxyAps({
          params: { ...params, serviceId: formData.serviceId },
          payload: [serialNumber]
        }).unwrap().then(resetForm)
      } else if (originalServiceId) { // Disable the mDNS Proxy which has been applied before
        await deleteMdnsProxyAps({
          params: { ...params, serviceId: originalServiceId },
          payload: [serialNumber]
        }).unwrap().then(resetForm)
      }
    } catch (error) {
      const errorResponse = error as catchErrorResponse
      const errorMsg = errorResponse.data.errors.map(err => err.message).join('<br />')

      showToast({
        type: 'error',
        content: errorMsg ?? $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <Loader states={[{
      isLoading,
      isFetching: isDataFetching || isUpdating || isDeleting
    }]}>
      <StepsForm
        onCancel={() => navigate(wifiDetailPath)}
        buttonLabel={{
          submit: $t({ defaultMessage: 'Apply mDNS Proxy' })
        }}
        onFormChange={() => setIsFormChangedHandled(false)}
      >
        {isSuccess &&
          <StepsForm.StepForm<MdnsProxyTabFormFieldType>
            formRef={formRef}
            onFinish={onSave}
            layout='horizontal'
          >
            <GridRow>
              <GridCol col={{ span: 7 }}>
                <MdnsProxyTabFormField serviceId={apDetail.multicastDnsProxyServiceProfileId} />
              </GridCol>
            </GridRow>
          </StepsForm.StepForm>
        }
      </StepsForm>
    </Loader>
  )
}
