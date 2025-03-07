import { useEffect, useMemo, useState } from 'react'

import { FetchBaseQueryError }                              from '@reduxjs/toolkit/query'
import { Col, Form, FormInstance, Row, Switch, Typography } from 'antd'
import { useIntl }                                          from 'react-intl'

import { Loader, StepsForm, Tooltip } from '@acx-ui/components'
import {
  useGetPropertyConfigsQuery,
  useGetVenueQuery,
  usePatchPropertyConfigsMutation,
  useUpdatePropertyConfigsMutation
} from '@acx-ui/rc/services'
import {
  EditPropertyConfigMessages,
  PropertyConfigs,
  PropertyConfigStatus,
  PropertyUrlsInfo,
  ResidentPortalType
} from '@acx-ui/rc/utils'
import { useParams }            from '@acx-ui/react-router-dom'
import { hasAllowedOperations } from '@acx-ui/user'
import { getOpsApi }            from '@acx-ui/utils'

import { showDeletePropertyManagementModal }                                                  from './DeletePropertyManagementModal'
import { PropertyManagementForm }                                                             from './PropertyManagementForm'
import { getInitialPropertyFormValues, toResidentPortalPayload, useRegisterMessageTemplates } from './utils'

export { PropertyManagementForm }

interface VenuePropertyManagementFormProps {
  venueId: string
  onFinish?: (values: PropertyConfigs) => Promise<boolean | void>
  onCancel?: () => void
  onValueChange?: () => void
  isSubmitting?: boolean
  submitButtonLabel?: string
  form?: FormInstance
  preSubmit?: () => void
  postSubmit?: () => void
}

export const VenuePropertyManagementForm = (props: VenuePropertyManagementFormProps) => {
  const {
    form: customForm, venueId, onFinish, onCancel,
    onValueChange, isSubmitting, submitButtonLabel,
    preSubmit, postSubmit
  } = props

  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [form] = Form.useForm(customForm)

  const [isPropertyEnable, setIsPropertyEnable] = useState<boolean>(false)
  const [updatePropertyConfigs] = useUpdatePropertyConfigsMutation()
  const [patchPropertyConfigs] = usePatchPropertyConfigsMutation()
  const { registerMessageTemplates, registrationResult } = useRegisterMessageTemplates()

  const { data: venueData } = useGetVenueQuery({ params: { tenantId, venueId } })
  const propertyConfigsQuery = useGetPropertyConfigsQuery(
    { params: { venueId } },
    { skip: !venueId })
  const propertyNotFound = useMemo(() =>
    (propertyConfigsQuery?.error as FetchBaseQueryError)?.status === 404,
  [propertyConfigsQuery.error]
  )
  // Create -> PUT, Update -> Put + PATCH, Delete -> PATCH
  const hasActivatePropertyPermission
    = hasAllowedOperations([getOpsApi(PropertyUrlsInfo.updatePropertyConfigs)])
  const hasDeactivatePropertyPermission
    = hasAllowedOperations([getOpsApi(PropertyUrlsInfo.patchPropertyConfigs)])
  const hasManagePermission = propertyNotFound
    ? hasActivatePropertyPermission
    : hasDeactivatePropertyPermission
  // Two cases can modify the PropertyConfig.
  // 1. Has PUT permission means user can modify the PropertyConfig
  // 2. If only has PATCH permission, user can only disable the Property
  const hasSavePermission
    = hasActivatePropertyPermission || (!propertyNotFound && !isPropertyEnable)
  const { data: propertyConfigs } = propertyConfigsQuery

  // set initial values
  const initialValues = useMemo(() => {
    return getInitialPropertyFormValues(propertyConfigs)
  }, [propertyConfigs])

  useEffect(() => {
    if (propertyConfigsQuery.isLoading || !propertyConfigs) return
    let enabled

    // If the user disable the Property, it will get 404 for this venue.
    // Therefore, we need to assign to `false` manually to prevent cache issue.
    if ((propertyConfigsQuery?.error as FetchBaseQueryError)?.status === 404) {
      enabled = false
    } else {
      enabled = propertyConfigs?.status === PropertyConfigStatus.ENABLED
    }

    setIsPropertyEnable(enabled)
  }, [propertyConfigs])

  const handlePropertyEnable = (enabled: boolean) => {
    if (!enabled) {
      showDeletePropertyManagementModal(() => setIsPropertyEnable(false), 'Delete')
    } else {
      setIsPropertyEnable(enabled)
    }
  }

  const onFormFinish = async (values: PropertyConfigs) => {
    const {
      unitConfig,
      residentPortalType,
      communicationConfig,
      ...formValues
    } = values

    preSubmit?.()

    try {
      if (isPropertyEnable) {
        await registerMessageTemplates(form, venueId, venueData)
        await updatePropertyConfigs({
          params: { venueId },
          payload: {
            ...formValues,
            venueName: venueData?.name ?? venueId,
            description: venueData?.description,
            address: venueData?.address,
            status: PropertyConfigStatus.ENABLED,
            unitConfig: {
              ...unitConfig,
              ...toResidentPortalPayload(residentPortalType as ResidentPortalType)
            },
            communicationConfig: {
              ...communicationConfig,
              // these values must match the registration id in th TemplateSelector form items
              unitAssignmentHtmlRegId: venueId,
              unitAssignmentTextRegId: venueId,
              unitPassphraseChangeHtmlRegId: venueId,
              unitPassphraseChangeTextRegId: venueId,
              guestPassphraseChangeHtmlRegId: venueId,
              guestPassphraseChangeTextRegId: venueId,
              portalAccessResetHtmlRegId: venueId,
              portalAccessResetTextRegId: venueId,
              portAssignmentHtmlRegId: venueId,
              portAssignmentTextRegId: venueId
            }
          }
        }).unwrap()
      } else {
        // if property not found, we could not send PUT request to modify the property entity.
        if (propertyNotFound) return
        await patchPropertyConfigs({
          params: { venueId },
          payload: { status: PropertyConfigStatus.DISABLED }
        }).unwrap()
      }
      postSubmit?.()
    } catch (e) {
      console.log(e) // eslint-disable-line no-console
    }
  }

  return <Loader states={[
    {
      ...propertyConfigsQuery, error: undefined,
      isLoading: propertyConfigsQuery.isLoading
    },
    { isLoading: false, isFetching: isSubmitting || registrationResult.isLoading }
  ]}>
    <Row gutter={20} style={{ marginBottom: '12px' }}>
      <Col span={8}>
        <Typography.Text>
          {$t({ defaultMessage: 'Enable Property Management' })}
        </Typography.Text>

        <Switch
          data-testid={'property-enable-switch'}
          checked={isPropertyEnable}
          disabled={!hasManagePermission}
          onChange={handlePropertyEnable}
          style={{ marginLeft: '20px' }}
        />

        <Tooltip.Question
          title={$t(EditPropertyConfigMessages.ENABLE_PROPERTY_TOOLTIP)}
          placement={'bottom'}
        />
      </Col>
    </Row>

    <StepsForm
      disabled={!hasSavePermission}
      form={form}
      onFinish={onFinish || onFormFinish}
      onValuesChange={onValueChange}
      onCancel={onCancel}
      buttonLabel={{ submit: submitButtonLabel || $t({ defaultMessage: 'Save' }) }}
      initialValues={initialValues}
    >
      <StepsForm.StepForm>
        {isPropertyEnable && <Row>
          <Col span={8}>
            <PropertyManagementForm
              form={form}
              venueId={venueId}
              initialValues={initialValues}
            />
          </Col>
        </Row>}
      </StepsForm.StepForm>
    </StepsForm>
  </Loader>
}
