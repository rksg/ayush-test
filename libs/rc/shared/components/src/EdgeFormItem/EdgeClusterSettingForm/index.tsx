import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { Col, Form, FormInstance, FormListFieldData, FormListOperation, Input, Row } from 'antd'
import TextArea                                                                      from 'antd/lib/input/TextArea'
import { useIntl }                                                                   from 'react-intl'
import { useParams }                                                                 from 'react-router-dom'

import { Alert, Button, Select, Subtitle, useStepFormContext }                                            from '@acx-ui/components'
import { DeleteOutlinedIcon }                                                                             from '@acx-ui/icons'
import { useVenuesListQuery }                                                                             from '@acx-ui/rc/services'
import { EdgeClusterTableDataType, EdgeStatusEnum, PRODUCT_CODE_VIRTUAL_EDGE, edgeSerialNumberValidator } from '@acx-ui/rc/utils'

import { showDeleteModal } from '../../useEdgeActions'

interface EdgeClusterSettingFormProps {
  editData?: EdgeClusterTableDataType
}

export interface EdgeClusterSettingFormType {
  smartEdges: {
      name: string
      serialNumber: string
      model: string
      isEdit?: boolean
  }[]
  venueId: string
  name: string
  description?: string
}

const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000
}

export const EdgeClusterSettingForm = (props: EdgeClusterSettingFormProps) => {
  const { editData } = props
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { form } = useStepFormContext()
  const formListRef = useRef<NodeListRef>()
  const smartEdges = Form.useWatch('smartEdges', form) as EdgeClusterSettingFormType['smartEdges']
  const { venueOptions, isLoading: isVenuesListLoading } = useVenuesListQuery({
    params: { tenantId }, payload: venueOptionsDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })

  useEffect(() => {
    if(editData) {
      form.setFieldsValue({
        venueId: editData.venueId,
        name: editData.name,
        description: editData.description,
        smartEdges: editData.edgeList?.map(item => ({
          name: item.name,
          serialNumber: item.serialNumber,
          model: item.type,
          isEdit: true
        }))
      })
    }
  }, [editData])

  const editMode = !!editData

  const maxNodeCount = 2

  const clusterWarningMsg = $t({ defaultMessage: `The cluster function will operate
  when there are at least two nodes present. Please add more nodes to establish
  a complete cluster.` })

  const otpWarningMsg = $t({ defaultMessage: `The one-time-password (OTP) will be 
  automatically sent to your email address or via SMS for verification when you add
  a virtual SmartEdge node. The password will expire in 10 minutes and you must 
  complete the authentication process before using it.` })

  const showClusterWarning = (editData?.edgeList?.filter(item =>
    item.deviceStatus === EdgeStatusEnum.OPERATIONAL).length ?? 0) < 2

  const showOtpMessage = smartEdges?.some(item =>
    !item?.isEdit &&
    item?.serialNumber?.startsWith(PRODUCT_CODE_VIRTUAL_EDGE))

  const deleteNode = (fieldName: number, serialNumber?: string) => {
    if(!smartEdges?.[fieldName]?.isEdit) {
      formListRef.current?.remove(fieldName)
      return
    }
    const target = editData?.edgeList?.find(item => item.serialNumber === serialNumber)
    if(target) {
      showDeleteModal([target], () => formListRef.current?.remove(fieldName))
    }
  }

  return (
    <>
      <Row>
        <Col span={6}>
          <Form.Item
            name='venueId'
            label={$t({ defaultMessage: 'Venue' })}
            rules={[{
              required: true
            }]}
          >
            <Select
              options={venueOptions}
              disabled={editMode}
              loading={isVenuesListLoading}
            />
          </Form.Item>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Cluster Name' })}
            rules={[
              { required: true },
              { max: 64 }
            ]}
            children={<Input />}
            validateFirst
          />
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            children={<TextArea rows={4} maxLength={255} />}
          />
        </Col>
      </Row>
      <Row style={{ marginTop: 30 }}>
        <Col span={14}>
          <Row>
            <Col span={8}>
              <Subtitle level={3}>
                {
                  $t({ defaultMessage: 'SmartEdges ({edgeCount})' },
                    { edgeCount: editData?.edgeList?.length ?? 0 })
                }
              </Subtitle>
            </Col>
            <Col style={{ textAlign: 'end' }} span={13}>
              <Button
                type='link'
                children={$t({ defaultMessage: 'Add another SmartEdge' })}
                onClick={() => formListRef.current?.add()}
                disabled={(smartEdges?.length ?? 0) >= maxNodeCount}
              />
            </Col>
            {
              showClusterWarning &&
              <Col span={21}>
                <Alert message={clusterWarningMsg} type='info' showIcon />
              </Col>
            }
          </Row>
          <Form.List
            name='smartEdges'
            initialValue={[{}]}
          >
            {
              (fields, operations) => (
                <NodeList
                  ref={formListRef}
                  form={form}
                  fields={fields}
                  operations={operations}
                  deleteNode={deleteNode}
                />
              )
            }
          </Form.List>
          {
            showOtpMessage &&
            <Row>
              <Col span={21}>
                <Alert message={otpWarningMsg} type='info' showIcon />
              </Col>
            </Row>
          }
        </Col>
      </Row>
    </>
  )
}

interface NodeListRef {
  add: () => void
  remove: (fieldName: number) => void
}

interface NodeListProps {
  form: FormInstance
  fields: FormListFieldData[]
  operations: FormListOperation
  deleteNode: (fieldName: number, serialNumber?: string) => void
}

const NodeList = forwardRef((props: NodeListProps, ref) => {
  const { form, fields, operations, deleteNode } = props
  const { $t } = useIntl()
  const smartEdges = Form.useWatch('smartEdges', form) as EdgeClusterSettingFormType['smartEdges']

  useImperativeHandle(ref, () => ({
    add: () => {
      operations.add()
    },
    remove: (fieldName: number) => {
      operations.remove(fieldName)
    }
  }), [operations])

  return <>
    {
      fields.map(field =>
        <Row key={field.key} align='middle' gutter={20}>
          <Col span={7}>
            <Form.Item
              name={[field.name, 'name']}
              label={$t({ defaultMessage: 'SmartEdge Name' })}
              rules={[
                { required: true },
                { max: 64 }
              ]}
              children={<Input />}
            />
          </Col>
          <Col span={9}>
            <Form.Item
              name={[field.name, 'serialNumber']}
              label={$t({ defaultMessage: 'Serial Number' })}
              rules={[
                { required: true },
                { validator: (_, value) => edgeSerialNumberValidator(value) }
              ]}
              children={<Input disabled={smartEdges?.[field.name]?.isEdit} />}
              validateFirst
            />
          </Col>
          <Col span={3}>
            <Form.Item
              label={$t({ defaultMessage: 'Model' })}
              children={smartEdges?.[field.name]?.model ??'-'}
            />
          </Col>
          <Col span={4}>
            <Button
              aria-label='delete'
              type='link'
              size='large'
              icon={<DeleteOutlinedIcon />}
              onClick={() => deleteNode(field.name, smartEdges?.[field.name]?.serialNumber)}
              disabled={fields.length < 2}
            />
          </Col>
        </Row>
      )
    }
  </>
})