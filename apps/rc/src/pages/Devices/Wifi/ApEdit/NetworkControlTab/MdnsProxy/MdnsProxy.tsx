import { useContext, useEffect, useRef, useState } from 'react'

import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'
import styled           from 'styled-components/macro'

import {
  GridCol,
  GridRow,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { MdnsProxySelector }                                         from '@acx-ui/rc/components'
import { useGetApQuery }                                             from '@acx-ui/rc/services'
import { useAddMdnsProxyApsMutation, useDeleteMdnsProxyApsMutation } from '@acx-ui/rc/services'
import { useParams }                                                 from '@acx-ui/react-router-dom'

import { ApEditContext } from '../..'

import * as UI from './styledComponents'

const MdnsProxyFormField = styled((props: { className?: string, serviceId?: string }) => {
  const form = Form.useFormInstance()
  const serviceEnabled = Form.useWatch<boolean>('serviceEnabled', form)
  const { $t } = useIntl()
  const { className, serviceId } = props

  return (
    <div className={className}>
      <StepsFormLegacy.FieldLabel
        width={'max-content'}
        style={{ marginBottom: '16px' }}>
        <span>{$t({ defaultMessage: 'Activate Service' })}</span>
        <Form.Item
          name='serviceEnabled'
          valuePropName='checked'
          initialValue={!!serviceId}
        >
          <Switch style={{ marginLeft: '20px' }}/>
        </Form.Item>
      </StepsFormLegacy.FieldLabel>
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

interface MdnsProxyFormFieldType {
  serviceEnabled: boolean
  serviceId?: string
}

export function MdnsProxy () {
  const formRef = useRef<StepsFormLegacyInstance<MdnsProxyFormFieldType>>()
  const { $t } = useIntl()
  const params = useParams()
  const { serialNumber } = params
  const [ isFormChangedHandled, setIsFormChangedHandled ] = useState(true)

  const {
    editContextData,
    setEditContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData
  } = useContext(ApEditContext)

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
      updateEditContextData(isServiceChanged())
      setIsFormChangedHandled(true)
    }
  }, [isFormChangedHandled])

  const isServiceChanged = (): boolean => {
    const formData = formRef.current!.getFieldsValue()
    const serviceId = apDetail!.multicastDnsProxyServiceProfileId

    return formData.serviceId !== serviceId ||
      (formData.serviceEnabled && !serviceId)
  }

  const isFormInvalid = () => {
    return formRef.current!.getFieldsError().map(item => item.errors).flat().length > 0
  }

  const updateEditContextData = (dataChanged: boolean) => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networkControl',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: true,
      hasError: dataChanged ? isFormInvalid() : editContextData.hasError
    })

    setEditNetworkControlContextData({
      ...editNetworkControlContextData,
      updateMdnsProxy: () => {
        dataChanged && onSave(formRef.current!.getFieldsValue())
      },
      discardMdnsProxyChanges: () => {
        dataChanged && formRef.current!.resetFields()
      }
    })
  }

  const resetForm = () => {
    refetch()
    updateEditContextData(false)
  }

  const onSave = async (formData: MdnsProxyFormFieldType) => {
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
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Loader states={[{
      isLoading,
      isFetching: isDataFetching || isUpdating || isDeleting
    }]}>
      <StepsFormLegacy
        formRef={formRef}
        onFormChange={() => setIsFormChangedHandled(false)}
      >
        {isSuccess &&
          <StepsFormLegacy.StepForm<MdnsProxyFormFieldType>
            //onFinish={onSave}
            layout='horizontal'
          >
            <GridRow>
              <GridCol col={{ span: 7 }}>
                <MdnsProxyFormField serviceId={apDetail.multicastDnsProxyServiceProfileId} />
              </GridCol>
            </GridRow>
          </StepsFormLegacy.StepForm>
        }
      </StepsFormLegacy>
    </Loader>
  )
}
