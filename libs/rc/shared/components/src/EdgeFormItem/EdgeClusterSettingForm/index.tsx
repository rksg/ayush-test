import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { Col, Form, FormInstance, FormListFieldData, FormListOperation, Input, Row } from 'antd'
import TextArea                                                                      from 'antd/lib/input/TextArea'
import { useIntl }                                                                   from 'react-intl'
import { useParams }                                                                 from 'react-router-dom'

import { Alert, Button, Select, Subtitle, useStepFormContext } from '@acx-ui/components'
import { Features }                                            from '@acx-ui/feature-toggle'
import { DeleteOutlinedIcon }                                  from '@acx-ui/icons'
import {
  useGetEdgeFeatureSetsQuery,
  useGetVenueEdgeFirmwareListQuery,
  useVenuesListQuery
} from '@acx-ui/rc/services'
import {
  ClusterHighAvailabilityModeEnum,
  EdgeClusterStatus,
  EdgeStatusEnum,
  EdgeUrlsInfo,
  IncompatibilityFeatures,
  deriveEdgeModel,
  edgeSerialNumberValidator,
  isOtpEnrollmentRequired,
  MAX_EDGE_AA_NODES_COUNT,
  MAX_EDGE_AB_NODES_COUNT
} from '@acx-ui/rc/utils'
import { hasPermission }              from '@acx-ui/user'
import { compareVersions, getOpsApi } from '@acx-ui/utils'

import { EdgeCompatibilityDrawer, EdgeCompatibilityType } from '../../Compatibility/Edge/EdgeCompatibilityDrawer'
import { showDeleteModal, useIsEdgeFeatureReady }         from '../../useEdgeActions'

import { HaModeRadioGroupFormItem } from './HaModeRadioGroupFormItem'
import { messageMapping }           from './messageMapping'
import { FwDescription, FwVersion } from './styledComponents'

interface EdgeClusterSettingFormProps {
  editData?: EdgeClusterStatus
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
  highAvailabilityMode: ClusterHighAvailabilityModeEnum
}

const venueOptionsDefaultPayload = {
  fields: ['name', 'id'],
  sortField: 'name',
  sortOrder: 'ASC',
  pageSize: 10000
}

const haAaFeatureRequirementPayload = {
  filters: {
    featureNames: ['HA-AA']
  }
}

export const EdgeClusterSettingForm = (props: EdgeClusterSettingFormProps) => {
  const { editData } = props
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const isEdgeHaAaReady = useIsEdgeFeatureReady(Features.EDGE_HA_AA_TOGGLE)

  // eslint-disable-next-line max-len
  const [edgeCompatibilityFeature, setEdgeCompatibilityFeature] = useState<IncompatibilityFeatures | undefined>()

  const { form } = useStepFormContext()
  const formListRef = useRef<NodeListRef>()
  const smartEdges = Form.useWatch('smartEdges', form) as EdgeClusterSettingFormType['smartEdges']
  const haMode = Form.useWatch('highAvailabilityMode', form) as ClusterHighAvailabilityModeEnum
  const venueId = Form.useWatch('venueId', form) as string
  const editMode = !!editData

  const { venueOptions, isLoading: isVenuesListLoading } = useVenuesListQuery({
    params: { tenantId }, payload: venueOptionsDefaultPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        venueOptions: data?.data.map(item => ({ label: item.name, value: item.id })),
        isLoading
      }
    }
  })
  const { requiredFw, isLoading: isFeatureSetsLoading } = useGetEdgeFeatureSetsQuery({
    params: { tenantId }, payload: haAaFeatureRequirementPayload }, {
    selectFromResult: ({ data, isLoading }) => {
      return {
        requiredFw: data?.featureSets
          ?.find(item => item.featureName === IncompatibilityFeatures.HA_AA)?.requiredFw,
        isLoading
      }
    }
  })
  const {
    data: venueFirmwareList,
    isLoading: isVenueFirmwareListLoading
  } = useGetVenueEdgeFirmwareListQuery({})

  const getVenueFirmware = (venueId: string) => {
    return venueFirmwareList?.find(item => item.id === venueId)?.versions?.[0]?.id
  }

  useEffect(() => {
    if(editData) {
      form.setFieldsValue({
        venueId: editData.venueId,
        name: editData.name,
        description: editData.description,
        highAvailabilityMode: editData.highAvailabilityMode,
        smartEdges: editData.edgeList?.map(item => ({
          name: item.name,
          serialNumber: item.serialNumber,
          model: item.model ?? deriveEdgeModel(item.serialNumber),
          isEdit: true
        }))
      })
    } else {
      form.setFieldsValue({ highAvailabilityMode:
        (!isEdgeHaAaReady || isAaNotSuportedByFirmware()) ?
          ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY :
          ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE })
    }
  }, [editData, venueId])

  const showClusterWarning = (editData?.edgeList?.filter(item =>
    item.deviceStatus === EdgeStatusEnum.OPERATIONAL).length ?? 0) < 2

  const showOtpMessage = smartEdges?.some(item =>
    !item?.isEdit &&
    isOtpEnrollmentRequired(item?.serialNumber ?? ''))

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

  const isAaSelected = () => {
    return haMode === ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE
  }
  const getMaxNodes = () => {
    return isAaSelected() ? MAX_EDGE_AA_NODES_COUNT : MAX_EDGE_AB_NODES_COUNT
  }
  const isDisableAddEdgeButton = () => {
    return (smartEdges?.length ?? 0) >= getMaxNodes() ||
    !hasPermission({ rbacOpsIds: [getOpsApi(EdgeUrlsInfo.addEdge)] })
  }
  const isAaNotSuportedByFirmware = () => {
    let venueVersion = getVenueFirmware(venueId)
    return Boolean(requiredFw && venueVersion && compareVersions(venueVersion, requiredFw) < 0)
  }
  const isDisableHaModeRadio = () => {
    if (isFeatureSetsLoading) {
      return true
    }
    // eslint-disable-next-line max-len
    let exceedAbNodeCountLimit = isAaSelected() && (smartEdges?.length ?? 0) > MAX_EDGE_AB_NODES_COUNT
    return exceedAbNodeCountLimit || isAaNotSuportedByFirmware()
  }

  return (
    <>
      <Row>
        <Col span={6}>
          <Form.Item
            name='venueId'
            label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            rules={[{
              required: true
            }]}
            extra={
              <div>
                <FwDescription>
                  {$t({ defaultMessage:
                    '<VenueSingular></VenueSingular> firmware version for RUCKUS Edge:'
                  })}
                </FwDescription> <FwVersion>{getVenueFirmware(venueId)}</FwVersion>
              </div>
            }
          >
            <Select
              options={venueOptions}
              disabled={editMode}
              loading={isVenuesListLoading || isVenueFirmwareListLoading}
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

      {isEdgeHaAaReady && <Row style={{ marginTop: 8 }}>
        <Col span={12}>
          <HaModeRadioGroupFormItem
            initialValue={ClusterHighAvailabilityModeEnum.ACTIVE_ACTIVE}
            editMode={editMode}
            disabled={isDisableHaModeRadio()}
            setEdgeCompatibilityModalFeature={setEdgeCompatibilityFeature}
          />
        </Col>
      </Row>}

      <Row style={{ marginTop: 30 }}>
        <Col span={14}>
          <Row>
            <Col span={8}>
              <Subtitle level={3}>
                {
                  $t({ defaultMessage: 'RUCKUS Edges ({edgeCount})' },
                    { edgeCount: editData?.edgeList?.length ?? 0 })
                }
              </Subtitle>
            </Col>
            {
              showClusterWarning &&
              <Col span={21}>
                <Alert message={$t(messageMapping.clusterWarningMsg)} type='info' showIcon />
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
            !isDisableAddEdgeButton() &&
            <Row>
              <Col span={13}>
                <Button
                  type='link'
                  children={$t({ defaultMessage: 'Add another RUCKUS Edge' })}
                  onClick={() => formListRef.current?.add()}
                  disabled={isDisableAddEdgeButton()}
                />
              </Col>
            </Row>
          }
          {
            showOtpMessage &&
            <Row>
              <Col span={21}>
                <Alert message={$t(messageMapping.otpWarningMsg)} type='info' showIcon />
              </Col>
            </Row>
          }
        </Col>
      </Row>
      {edgeCompatibilityFeature && <EdgeCompatibilityDrawer
        visible
        type={EdgeCompatibilityType.ALONE}
        title={$t({ defaultMessage: 'Compatibility Requirement' })}
        featureName={edgeCompatibilityFeature}
        onClose={() => setEdgeCompatibilityFeature(undefined)}
      />}
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

  const onSerialChanged = (index: number, serial: string) => {
    let { smartEdges } = form.getFieldsValue()
    if (smartEdges[index]) {
      smartEdges[index].model = deriveEdgeModel(serial)
      form.setFieldsValue({ smartEdges })
    }
  }

  return <>
    {
      fields.map((field, idx) =>
        <Row key={field.key} align='middle' gutter={20}>
          <Col span={7}>
            <Form.Item
              name={[field.name, 'name']}
              label={$t({ defaultMessage: 'RUCKUS Edge Name' })}
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
              children={<Input disabled={smartEdges?.[field.name]?.isEdit}
                onChange={
                  (e) => onSerialChanged(idx, e.target.value)
                } />}
              validateFirst
            />
          </Col>
          <Col span={3}>
            <Form.Item
              label={$t({ defaultMessage: 'Model' })}
              children={smartEdges?.[field.name]?.model ?? '-'}
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