import { useContext, useEffect, useRef } from 'react'

import { Form, Switch } from 'antd'
import { omit }         from 'lodash'
import { useIntl }      from 'react-intl'
import styled           from 'styled-components/macro'

import {
  AnchorContext,
  GridCol,
  GridRow,
  Loader,
  StepsFormLegacy,
  StepsFormLegacyInstance
} from '@acx-ui/components'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import { ApMdnsProxySelector }            from '@acx-ui/rc/components'
import { useGetApMdnsProxySettingsQuery } from '@acx-ui/rc/services'
import {
  useAddMdnsProxyApsMutation,
  useDeleteMdnsProxyApsMutation
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import { ApDataContext, ApEditContext, ApEditItemProps } from '../..'

import * as UI from './styledComponents'

const MdnsProxyFormField = styled((props: {
  className?: string,
  serviceId?: string,
  disabled?: boolean
}) => {
  const form = Form.useFormInstance()
  const serviceEnabled = Form.useWatch<boolean>('serviceEnabled', form)
  const { $t } = useIntl()
  const { className, serviceId, disabled } = props

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
          <Switch disabled={disabled}
            style={{ marginLeft: '20px' }}/>
        </Form.Item>
      </StepsFormLegacy.FieldLabel>
      {serviceEnabled &&
        <ApMdnsProxySelector
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

export function MdnsProxy (props: ApEditItemProps) {
  const formRef = useRef<StepsFormLegacyInstance<MdnsProxyFormFieldType>>()
  const { $t } = useIntl()
  const params = useParams()
  const { serialNumber } = params
  const { isAllowEdit=true } = props

  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const {
    editContextData,
    setEditContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData
  } = useContext(ApEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const { venueData } = useContext(ApDataContext)

  const {
    data: mdnsProxyData,
    isFetching: isDataFetching,
    isLoading,
    isSuccess
  } = useGetApMdnsProxySettingsQuery({
    params: { ...params, venueId: venueData?.id }
  })

  const [ addMdnsProxyAps, { isLoading: isUpdating } ] = useAddMdnsProxyApsMutation()
  const [ deleteMdnsProxyAps, { isLoading: isDeleting } ] = useDeleteMdnsProxyApsMutation()

  useEffect(() => {
    if (mdnsProxyData && !isLoading) {
      setReadyToScroll?.(r => [...(new Set(r.concat('mDNS-Proxy')))])
    }
  }, [mdnsProxyData, isLoading, setReadyToScroll])

  const isServiceChanged = (): boolean => {
    const formData = formRef.current!.getFieldsValue()
    const serviceId = mdnsProxyData?.id
    const serviceEnabled = !!serviceId

    return (formData.serviceEnabled !== serviceEnabled) ||
      (serviceEnabled && (formData.serviceId !== serviceId))
  }

  const isFormInvalid = () => {
    return formRef.current!.getFieldsError().map(item => item.errors).flat().length > 0
  }

  const updateEditContextData = (hasChanged: boolean) => {
    const newEditNetworkControlContextData = (hasChanged)? {
      ...editNetworkControlContextData,
      updateMdnsProxy: () => { onSave(formRef.current!.getFieldsValue()) },
      discardMdnsProxyChanges: () => { formRef.current!.resetFields() }
    } : {
      ...omit(editNetworkControlContextData, ['updateMdnsProxy', 'discardMdnsProxyChanges'])
    }
    setEditNetworkControlContextData(newEditNetworkControlContextData)

    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networkControl',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: Object.keys(newEditNetworkControlContextData).length > 0,
      hasError: hasChanged ? isFormInvalid() : editContextData.hasError
    })

  }

  const onSave = async (formData: MdnsProxyFormFieldType) => {
    const { id: originalServiceId } = mdnsProxyData || {}

    try {
      if (formData.serviceEnabled && serialNumber) {
        await addMdnsProxyAps({
          params: { ...params, serviceId: formData.serviceId, venueId: venueData?.id },
          payload: [serialNumber],
          enableRbac
        }).unwrap()
      } else if (originalServiceId && serialNumber) { // Disable the mDNS Proxy which has been applied before
        await deleteMdnsProxyAps({
          params: { ...params, serviceId: originalServiceId, venueId: venueData?.id },
          payload: [serialNumber],
          enableRbac
        }).unwrap()
      }

      setEditContextData({
        ...editContextData,
        isDirty: false,
        hasError: false
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleFormChanged = () => {
    updateEditContextData(isServiceChanged())
  }

  return (
    <Loader states={[{
      isLoading,
      isFetching: isDataFetching || isUpdating || isDeleting
    }]}>
      <StepsFormLegacy
        formRef={formRef}
        onFormChange={() => handleFormChanged()}
      >
        {isSuccess &&
          <StepsFormLegacy.StepForm<MdnsProxyFormFieldType>
            //onFinish={onSave}
            layout='horizontal'
          >
            <GridRow>
              <GridCol col={{ span: 7 }} style={{ minWidth: 400 }}>
                <MdnsProxyFormField
                  disabled={!isAllowEdit}
                  serviceId={mdnsProxyData?.id} />
              </GridCol>
            </GridRow>
          </StepsFormLegacy.StepForm>
        }
      </StepsFormLegacy>
    </Loader>
  )
}
