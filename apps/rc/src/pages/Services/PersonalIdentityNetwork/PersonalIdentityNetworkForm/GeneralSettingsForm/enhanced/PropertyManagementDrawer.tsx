import { Dispatch, SetStateAction, useMemo } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Drawer }                from '@acx-ui/components'
import {
  getInitialPropertyFormValues,
  PropertyManagementForm,
  toResidentPortalPayload,
  useRegisterMessageTemplates
} from '@acx-ui/rc/components'
import {
  useGetPropertyConfigsQuery,
  useGetVenueQuery,
  useUpdatePropertyConfigsMutation
} from '@acx-ui/rc/services'
import { PropertyConfigs, PropertyConfigStatus, ResidentPortalType } from '@acx-ui/rc/utils'

interface PropertyManagementDrawerProps {
  venueId: string
  visible: boolean
  setVisible: Dispatch<SetStateAction<boolean>>
}

export const PropertyManagementDrawer = (props: PropertyManagementDrawerProps) => {
  const { $t } = useIntl()
  const { venueId, visible, setVisible } = props
  const [form] = Form.useForm()

  const [updatePropertyConfigs] = useUpdatePropertyConfigsMutation()
  const { registerMessageTemplates } = useRegisterMessageTemplates()

  const { data: venueData } = useGetVenueQuery({ params: { venueId } }, { skip: !venueId })
  // eslint-disable-next-line max-len
  const propertyConfigsQuery = useGetPropertyConfigsQuery({ params: { venueId } },{ skip: !venueId })

  const handleClose = () => {
    setVisible(false)
  }

  const handleSubmit = async (values: PropertyConfigs) => {
    const {
      unitConfig,
      residentPortalType,
      communicationConfig,
      ...formValues
    } = values

    try {
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

      handleClose()
    } catch (e) {
      console.log(e) // eslint-disable-line no-console
    }
  }

  const initialValues = useMemo(() => {
    return getInitialPropertyFormValues(propertyConfigsQuery.data)
  }, [propertyConfigsQuery.data])

  const footer = <Drawer.FormFooter
    buttonLabel={{ save: $t({ defaultMessage: 'Activate' }) }}
    onCancel={handleClose}
    onSave={async () => form.submit()}
  />

  return <Drawer
    title={$t({ defaultMessage: 'Property Management: {venueName}' },
      { venueName: venueData?.name })}
    visible={visible}
    onClose={handleClose}
    footer={footer}
    destroyOnClose
    width='30%'
  >
    <Form
      layout='vertical'
      form={form}
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      <Row>
        <Col span={20}>
          <PropertyManagementForm
            form={form}
            venueId={venueId}
            initialValues={initialValues}
          />
        </Col>
      </Row>
    </Form>
  </Drawer>
}