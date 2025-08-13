import { useEffect, useState } from 'react'

import { Col, Form, FormInstance, Input, Row, Select } from 'antd'
import { FormattedMessage, useIntl }                   from 'react-intl'

import {
  Alert,
  Loader,
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Olt }         from '@acx-ui/olt/utils'
import {
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  LocationExtended,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  pageSize: 10000,
  sortField: 'name',
  sortOrder: 'ASC'
}

/* eslint-disable max-len */
const AlertMessage = () => (
  <Alert
    message={<FormattedMessage
      defaultMessage={
        `<b>Hardware Modules Auto-Install with OLT Activation</b><br></br>
        R1 will automatically install all compatible hardware components upon OLT initialization, including connected <b>line cards</b> and <b>network cards</b>.`
      }
      values={{
        b: (text: string) => <strong>{text}</strong>,
        br: () => <br />
      }} />}
    type='info'
    showIcon
    style={{ marginBottom: 20 }}
  />
)
/* eslint-enable max-len */

export const OltForm = (props: {
  editMode?: boolean
  data?: Partial<Olt>
  form: FormInstance
  onFinish: (values: Partial<Olt>) => Promise<boolean | void>
}) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { editMode, onFinish } = props
  const pageTitle = editMode
    ? $t({ defaultMessage: 'Edit Optical Switch' }) : $t({ defaultMessage: 'Add Optical Switch' })
  const [previousPath, setPreviousPath] = useState('')

  const location = useLocation()
  const basePath = useTenantLink('/devices/')
  const { venueOptions, isVenueOptsLoading } = useVenuesListQuery({
    payload: venueOptionsDefaultPayload
  }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isVenueOptsLoading: isLoading
      }
    }
  })

  useEffect(() => {
    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  useEffect(() => {
    if (editMode && props.data) {
      form.setFieldsValue(props.data)
    }
  }, [editMode, props.data])

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Wired' }) },
          { text: $t({ defaultMessage: 'Switches' }) },
          { text: $t({ defaultMessage: 'Optical List' }), link: '/devices/optical' }
        ]}
      />

      <StepsForm
        form={form}
        onFinish={onFinish}
        onCancel={() =>
          redirectPreviousPage(navigate, previousPath, `${basePath.pathname}/optical`)
        }
        buttonLabel={{
          submit: editMode ?
            $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }),
          cancel: $t({ defaultMessage: 'Cancel' })
        }}
      >
        <StepsForm.StepForm>
          <Loader
            states={[{
              isLoading: isVenueOptsLoading
            }]}
          >
            { !editMode && <AlertMessage /> }
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name='venueId'
                  label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
                  rules={[{
                    required: true,
                    // eslint-disable-next-line max-len
                    message: $t({ defaultMessage: 'Please select a <VenueSingular></VenueSingular>' })
                  }]}
                  children={
                    <Select
                      loading={isVenueOptsLoading}
                      placeholder={
                        $t({ defaultMessage: 'Select <venueSingular></venueSingular>...' })
                      }
                      options={venueOptions}
                      disabled={editMode}
                    />
                  }
                />
                <Form.Item
                  name='serialNumber'
                  label={$t({ defaultMessage: 'Serial Number' })}
                  rules={[{
                    required: true
                  }]}
                  children={<Input disabled={editMode} />}
                />
                <Form.Item
                  name='name'
                  label={$t({ defaultMessage: 'OLT Name' })}
                  rules={[{
                    required: true
                  }]}
                  children={<Input />}
                />

              </Col>
            </Row>

          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
