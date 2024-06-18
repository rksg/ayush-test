import { useEffect } from 'react'

import { Form } from 'antd'
import moment   from 'moment'

import { useAddCertificateAuthorityMutation, useAddSubCertificateAuthorityMutation, useUploadCertificateAuthorityMutation } from '@acx-ui/rc/services'
import { AlgorithmType, GenerationCaType }                                                                                  from '@acx-ui/rc/utils'

export default function useCertificateAuthorityForm () {
  const [createCaForm] = Form.useForm()
  const [addCertificateAuthority] = useAddCertificateAuthorityMutation()
  const [uploadCertificateAuthority] = useUploadCertificateAuthorityMutation()
  const [addSubCertificateAuthority] = useAddSubCertificateAuthorityMutation()
  const generation = Form.useWatch('generation', createCaForm)

  useEffect(() => {
    resetCaFormFeilds()
  }, [])

  const resetCaFormFeilds = () => {
    createCaForm.resetFields()
    createCaForm.setFieldsValue({
      generation: GenerationCaType.NEW,
      keyLength: 2048,
      algorithm: AlgorithmType.SHA_256,
      startDateMoment: moment(new Date().setMonth(new Date().getMonth() - 1)),
      expireDateMoment: moment(new Date().setFullYear(new Date().getFullYear() + 20))
    })
  }

  const handleFinish = async () => {
    const formData = createCaForm.getFieldsValue()
    await createCaForm.validateFields()
    if (generation === GenerationCaType.UPLOAD) {
      const uploadCaData = new FormData()
      if (formData.password) uploadCaData.append('password', formData.password)
      if (formData.publicKey) uploadCaData.append('publicKey', formData.publicKey.file)
      if (formData.privateKey) uploadCaData.append('privateKey', formData.privateKey.file)

      const res = await uploadCertificateAuthority({
        payload: uploadCaData,
        customHeaders: { 'Content-Type': undefined }
      }).unwrap()
      return res.id
    } else {
      const { caId, expireDateMoment, startDateMoment, generation, email, ...rest } = formData
      const payload = {
        ...rest,
        expireDate: expireDateMoment.startOf('day').toDate(),
        startDate: startDateMoment.startOf('day').toDate(),
        email: email ? email : undefined
      }
      if (generation === GenerationCaType.NEW) {
        const res = await addCertificateAuthority({ payload }).unwrap()
        return res.id
      } else {
        const res = await addSubCertificateAuthority({ payload, params: { caId } }).unwrap()
        return res.id
      }
    }
  }

  return {
    createCaForm,
    resetCaFormFeilds,
    handleFinish
  }
}