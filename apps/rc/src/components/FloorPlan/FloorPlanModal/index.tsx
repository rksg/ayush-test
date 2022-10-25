import { useEffect, useRef, useState } from 'react'

import { Form, Modal }  from 'antd'
import { FormInstance } from 'antd/es/form/Form'
import { useParams }    from 'react-router-dom'

import { Button }                                            from '@acx-ui/components'
import { useGetUploadURLMutation }                           from '@acx-ui/rc/services'
import { FloorPlanDto, FloorPlanFormDto, UploadUrlResponse } from '@acx-ui/rc/utils'
import { getIntl }                                           from '@acx-ui/utils'

import FloorPlanForm from '../FloorPlanForm'



const useResetFormOnCloseModal = ({ form, open }: {
    form: FormInstance
    open: boolean }) => {
  const prevOpenRef = useRef<boolean>()
  useEffect(() => {
    prevOpenRef.current = open
  }, [open])
  const prevOpen = prevOpenRef.current
  useEffect(() => {
    if (!open && prevOpen) {
      form.resetFields()
    }
  }, [form, prevOpen, open])
}


export default function AddEditFloorplanModal ({ onAddEditFloorPlan,
  isEditMode, selectedFloorPlan }: {
  onAddEditFloorPlan: Function, isEditMode: boolean, selectedFloorPlan?: FloorPlanDto }) {
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const params = useParams()
  // eslint-disable-next-line max-len
  const extensionsRegex: RegExp = /(png|jpeg|jpg|gif|bmp|svg|log|txt|csv|pdf|doc|docx|xls|xlsx|xml|json|jfif|tiff)$/i

  const { $t } = getIntl()

  const [getUploadURL] = useGetUploadURLMutation()

  useEffect(() => {
    if (isEditMode) {
      form.setFieldsValue({
        name: selectedFloorPlan?.name,
        imageName: selectedFloorPlan?.imageName,
        floorNumber: selectedFloorPlan?.floorNumber
      })
    }
  })

  useResetFormOnCloseModal({
    form,
    open
  })

  const onOk = () => {
    form.submit()
  }

  const showUserModal = () => {
    setOpen(true)
  }

  const hideUserModal = () => {
    setOpen(false)
  }

  const onFormSubmit = async function ({ formValues, file }: { formValues: any, file: File }) {
    if (file) {
      const extension: string = getFileExtension(file.name)
      const uploadUrl = await getUploadURL({
        params: { ...params },
        payload: { fileExtension: extension }
      }) as { data: UploadUrlResponse }

      if (uploadUrl && uploadUrl.data && uploadUrl.data.fileId) {
        await fetch(uploadUrl.data.signedUrl, { method: 'put', body: file, headers: {
          'Content-Type': ''
        } }).then(() => {
          const floorPlan: FloorPlanFormDto = {
            imageId: uploadUrl.data.fileId,
            imageName: formValues.imageName,
            name: formValues.name,
            floorNumber: formValues.floorNumber,
            id: ''
          }
          onAddEditFloorPlan(floorPlan, isEditMode)
          setOpen(false)
        })
      }
    } else {
      const floorPlan: FloorPlanFormDto = {
        imageId: selectedFloorPlan?.imageId as string,
        imageName: formValues.imageName,
        name: formValues.name,
        floorNumber: formValues.floorNumber,
        id: selectedFloorPlan?.id as string
      }
      onAddEditFloorPlan(floorPlan, isEditMode)
      setOpen(false)
    }
  }

  const getFileExtension = function (fileName: string) {
    const matched = extensionsRegex.exec(fileName)
    if (matched) {
      return matched[0]
    } else {
      return ''
    }
  }

  return (
    <Form.Provider>
      <Button size={isEditMode ? 'middle' : 'small'} type='link' onClick={showUserModal}>
        { !isEditMode ? $t({ defaultMessage: 'Add Floor Plan' })
          : $t({ defaultMessage: 'Edit' })}</Button>
      <Modal
        title={!isEditMode ? $t({ defaultMessage: 'Add Floor Plan' })
          : $t({ defaultMessage: 'Edit Floor Plan' })}
        visible={open}
        onOk={onOk}
        okText={$t({ defaultMessage: 'Save' })}
        onCancel={hideUserModal}>
        <FloorPlanForm form={form}
          onFormSubmit={onFormSubmit}
          imageFile={isEditMode ? selectedFloorPlan?.imageUrl: ''}/>
      </Modal>
    </Form.Provider>
  )
}