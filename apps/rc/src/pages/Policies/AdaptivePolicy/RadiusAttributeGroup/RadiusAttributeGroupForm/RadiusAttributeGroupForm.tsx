import React, { useEffect, useRef, useState } from 'react'

import { Col, Row }     from 'antd'
import _                from 'lodash'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { Loader, PageHeader, showToast, StepsForm, StepsFormInstance } from '@acx-ui/components'
import {
  useAddRadiusAttributeGroupMutation,
  useGetRadiusAttributeGroupQuery,
  useUpdateRadiusAttributeGroupMutation
} from '@acx-ui/rc/services'
import {
  AttributeAssignment,
  getPolicyRoutePath, OperatorType,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { RadiusAttributeDrawer }           from './RadiusAttributeDrawer'
import { RadiusAttributeGroupSettingForm } from './RadiusAttributeGroupSettingForm'

interface RadiusAttributeGroupFormProps {
  editMode?: boolean
}

export default function RadiusAttributeGroupForm (props: RadiusAttributeGroupFormProps) {
  const { $t } = useIntl()
  const { editMode = false } = props
  const { policyId } = useParams()
  // eslint-disable-next-line max-len
  const linkToList = useTenantLink('/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST }))
  const navigate = useNavigate()
  const formRef = useRef<StepsFormInstance>()
  // eslint-disable-next-line max-len
  const { data, isLoading } = useGetRadiusAttributeGroupQuery({ params: { policyId } }, { skip: !editMode })
  const [addRadiusAttributeGroup] = useAddRadiusAttributeGroupMutation()
  // eslint-disable-next-line max-len
  const [updateRadiusAttributeGroup, { isLoading: isUpdating }] = useUpdateRadiusAttributeGroupMutation()

  const [visible, setVisible] = useState(false)
  const [editAttribute, setEditAttribute] = useState<AttributeAssignment>()
  const [editAttributeMode, setEditAttributeMode] = useState(false)

  useEffect(() => {
    if(data) {
      formRef.current?.setFieldsValue({ ...data, attributeAssignments:
        data.attributeAssignments.map(attr => ({
          ...attr, id: uuidv4()
        }) ) } )
    }
  }, [data])

  const handleEdit = async () => {
    try {
      const submitData = formRef?.current?.getFieldsValue()
      const payload = {
        name: submitData.name,
        // eslint-disable-next-line max-len
        attributeAssignments: submitData.attributeAssignments.map((a:AttributeAssignment) => _.omit(a, 'id'))
      }
      await updateRadiusAttributeGroup({
        params: { policyId }, payload
      }).unwrap()

      showToast({
        type: 'success',
        content: $t(
          { defaultMessage: 'Group {name} was updated' },
          { name: submitData.name }
        )
      })

      navigate(linkToList, { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleAdd = async () =>{
    try {
      const submitData = formRef?.current?.getFieldsValue()
      const payload = {
        name: submitData.name,
        description: submitData.name,
        // eslint-disable-next-line max-len
        attributeAssignments: submitData.attributeAssignments.map((a:AttributeAssignment) => _.omit(a, 'id'))
      }
      await addRadiusAttributeGroup({ payload }).unwrap()

      showToast({
        type: 'success',
        content: $t(
          { defaultMessage: 'Group {name} was added' },
          { name: submitData.name }
        )
      })

      navigate(linkToList, { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const setAttributeAssignments = (attribute: AttributeAssignment) => {
    const attributeAssignments = formRef.current?.getFieldValue('attributeAssignments')
    // eslint-disable-next-line max-len
    const newAttribute: AttributeAssignment[] = attributeAssignments ? attributeAssignments.slice() : []
    if (editAttributeMode) {
      const targetIdx = newAttribute.findIndex((r: AttributeAssignment) => r.id === attribute.id)
      newAttribute.splice(targetIdx, 1, attribute)
    } else {
      attribute.id = uuidv4()
      newAttribute.push(attribute)
    }
    formRef.current?.setFieldValue('attributeAssignments', newAttribute)
  }

  const onAddClick = () => {
    setEditAttributeMode(false)
    setEditAttribute({
      attributeName: '' ,
      operator: OperatorType.ADD,
      attributeValue: ''
    } as AttributeAssignment)
    setVisible(true)
  }

  const onEditClick = (attribute: AttributeAssignment) => {
    setEditAttribute(attribute)
    setEditAttributeMode(true)
    setVisible(true)
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure {name}' }, { name: data?.name })
          : $t({ defaultMessage: 'Add RADIUS Attributes Group' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Policies & Profiles > RADIUS Attribute Groups' }),
            // eslint-disable-next-line max-len
            link: getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST })
          }
        ]}
      />
      <StepsForm
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onCancel={() => navigate(linkToList)}
        onFinish={editMode? handleEdit: handleAdd}>
        <StepsForm.StepForm>
          <Loader states={[{
            isLoading: isLoading,
            isFetching: isUpdating
          }]}>
            <Row>
              <Col span={10}>
                <RadiusAttributeGroupSettingForm
                  onAddClick={onAddClick}
                  onEditClick={onEditClick}
                />
              </Col>
            </Row>
            <RadiusAttributeDrawer
              visible={visible}
              setVisible={setVisible}
              isEdit={editAttributeMode}
              editAttribute={editAttribute}
              setAttributeAssignments={setAttributeAssignments}/>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
