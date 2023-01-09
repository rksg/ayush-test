import React, { useEffect, useRef } from 'react'

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
  getPolicyListRoutePath,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { RadiusAttributeGroupSettingForm } from './RadiusAttributeGroupSetting/RadiusAttributeGroupSettingForm'

interface RadiusAttributeGroupFormProps {
  editMode?: boolean
}

export default function RadiusAttributeGroupForm (props: RadiusAttributeGroupFormProps) {
  const intl = useIntl()
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
      navigate(linkToList, { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' }),
        // FIXME: Correct the error message
        link: { onClick: () => alert(JSON.stringify(error)) }
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
      navigate(linkToList, { replace: true })
    } catch (error) {
      showToast({
        type: 'error',
        content: intl.$t({ defaultMessage: 'An error occurred' }),
        // FIXME: Correct the error message
        link: { onClick: () => alert(JSON.stringify(error)) }
      })
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? intl.$t({ defaultMessage: 'Configure {name}' }, { name: data?.name })
          : intl.$t({ defaultMessage: 'Add RADIUS Attributes Group' })}
        breadcrumb={[
          {
            text: intl.$t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath()
          }
        ]}
      />
      <StepsForm
        editMode={editMode}
        formRef={formRef}
        buttonLabel={{ submit: intl.$t({ defaultMessage: 'Apply' }) }}
        onCancel={() => navigate(linkToList)}
        onFinish={editMode? handleEdit: handleAdd}>
        <StepsForm.StepForm>
          <Loader states={[{
            isLoading: isLoading,
            isFetching: isUpdating
          }]}>
            <RadiusAttributeGroupSettingForm/>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
