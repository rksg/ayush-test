import { useContext, useEffect, useRef } from 'react'

import { Form, Switch } from 'antd'
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
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ApMdnsProxySelector }    from '@acx-ui/rc/components'
import { useGetApQuery }          from '@acx-ui/rc/services'
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
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  const {
    editContextData,
    setEditContextData,
    editNetworkControlContextData,
    setEditNetworkControlContextData
  } = useContext(ApEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)
  const { venueData } = useContext(ApDataContext)

  const {
    data: apDetail,
    isFetching: isDataFetching,
    isLoading,
    isSuccess
  } = useGetApQuery({
    params: { ...params, venueId: venueData?.id },
    enableRbac: isUseWifiRbacApi
  })

  const [ addMdnsProxyAps, { isLoading: isUpdating } ] = useAddMdnsProxyApsMutation()
  const [ deleteMdnsProxyAps, { isLoading: isDeleting } ] = useDeleteMdnsProxyApsMutation()

  useEffect(() => {
    if (apDetail && !isLoading) {
      setReadyToScroll?.(r => [...(new Set(r.concat('mDNS-Proxy')))])
    }
  }, [apDetail, isLoading, setReadyToScroll])

  const isServiceChanged = (): boolean => {
    const formData = formRef.current!.getFieldsValue()
    const serviceId = apDetail!.multicastDnsProxyServiceProfileId
    const serviceEnabled = !!serviceId

    return (formData.serviceEnabled !== serviceEnabled) ||
      (serviceEnabled && (formData.serviceId !== serviceId))
  }

  const isFormInvalid = () => {
    return formRef.current!.getFieldsError().map(item => item.errors).flat().length > 0
  }

  const updateEditContextData = (dataChanged: boolean) => {
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'networkControl',
      tabTitle: $t({ defaultMessage: 'Network Control' }),
      isDirty: dataChanged,
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

  const onSave = async (formData: MdnsProxyFormFieldType) => {
    const originalServiceId = apDetail?.multicastDnsProxyServiceProfileId

    try {
      if (formData.serviceEnabled && serialNumber) {
        await addMdnsProxyAps({
          params: { ...params, serviceId: formData.serviceId, venueId: apDetail?.venueId },
          payload: [serialNumber],
          enableRbac
        }).unwrap()
      } else if (originalServiceId && serialNumber) { // Disable the mDNS Proxy which has been applied before
        await deleteMdnsProxyAps({
          params: { ...params, serviceId: originalServiceId, venueId: apDetail?.venueId },
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
                  serviceId={apDetail.multicastDnsProxyServiceProfileId} />
              </GridCol>
            </GridRow>
          </StepsFormLegacy.StepForm>
        }
      </StepsFormLegacy>
    </Loader>
  )
}
