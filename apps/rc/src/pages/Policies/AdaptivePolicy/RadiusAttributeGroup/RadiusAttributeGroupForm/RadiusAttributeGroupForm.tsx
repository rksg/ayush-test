import React, { useEffect, useRef, useState } from 'react'

import _                from 'lodash'
import { useIntl }      from 'react-intl'
import { v4 as uuidv4 } from 'uuid'

import { GridCol, GridRow, Loader, PageHeader, showToast, StepsFormLegacy, StepsFormLegacyInstance } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                    from '@acx-ui/feature-toggle'
import {
  useAddRadiusAttributeGroupMutation,
  useGetRadiusAttributeGroupQuery,
  useUpdateRadiusAttributeGroupMutation
} from '@acx-ui/rc/services'
import {
  AttributeAssignment, getPolicyListRoutePath,
  getPolicyRoutePath,
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
  const tablePath = getPolicyRoutePath(
    { type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST })
  const linkToList = useTenantLink(`/${tablePath}`)
  const navigate = useNavigate()
  const formRef = useRef<StepsFormLegacyInstance>()
  // eslint-disable-next-line max-len
  const { data, isLoading } = useGetRadiusAttributeGroupQuery({ params: { policyId } }, { skip: !editMode })
  const [addRadiusAttributeGroup] = useAddRadiusAttributeGroupMutation()
  // eslint-disable-next-line max-len
  const [updateRadiusAttributeGroup, { isLoading: isUpdating }] = useUpdateRadiusAttributeGroupMutation()

  const [visible, setVisible] = useState(false)
  const [editAttribute, setEditAttribute] = useState<AttributeAssignment>()
  const [editAttributeMode, setEditAttributeMode] = useState(false)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

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
      console.log(error) // eslint-disable-line no-console
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
      console.log(error) // eslint-disable-line no-console
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

  const getAttributeAssignments = () => {
    return formRef.current?.getFieldValue('attributeAssignments') ?? [] as AttributeAssignment []
  }

  const onAddClick = () => {
    setVisible(true)
    setEditAttributeMode(false)
  }

  const onEditClick = (attribute: AttributeAssignment) => {
    setVisible(true)
    setEditAttributeMode(true)
    setEditAttribute(attribute)
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Configure {name}' }, { name: data?.name })
          : $t({ defaultMessage: 'Add RADIUS Attributes Group' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'RADIUS Attribute Groups' }),
            link: tablePath }
        ] : [
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'RADIUS Attribute Groups' }),
            link: tablePath }
        ]}
      />
      <StepsFormLegacy
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onCancel={() => navigate(linkToList)}
        onFinish={editMode? handleEdit: handleAdd}>
        <StepsFormLegacy.StepForm>
          <Loader states={[{
            isLoading: isLoading,
            isFetching: isUpdating
          }]}>
            <GridRow>
              <GridCol col={{ span: 10 }}>
                <RadiusAttributeGroupSettingForm
                  onAddClick={onAddClick}
                  onEditClick={onEditClick}
                />
              </GridCol>
            </GridRow>
            <RadiusAttributeDrawer
              visible={visible}
              setVisible={setVisible}
              isEdit={editAttributeMode}
              editAttribute={editAttribute}
              setAttributeAssignments={setAttributeAssignments}
              getAttributeAssignments={getAttributeAssignments}/>
          </Loader>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </>
  )
}
