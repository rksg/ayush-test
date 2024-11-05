import { useEffect } from 'react'

import { Form } from 'antd'
import moment   from 'moment'

import { useGenerateClientServerCertificatesMutation, useUploadCertificateMutation } from '@acx-ui/rc/services'
import { AlgorithmType, CertificateGenerationType }                                  from '@acx-ui/rc/utils'

export default function useCertificateForm () {
  const [generateCertificateForm] = Form.useForm()
  const [generateClientServerCertificate] = useGenerateClientServerCertificatesMutation()
  const [uploadCertificate] = useUploadCertificateMutation()

  useEffect(() => {
    resetFormFeilds()
  }, [])

  const resetFormFeilds = () => {
    generateCertificateForm.resetFields()
    generateCertificateForm.setFieldsValue({
      generation: CertificateGenerationType.NEW,
      keyLength: 2048,
      algorithm: AlgorithmType.SHA_256,
      startDateMoment: moment(new Date().setMonth(new Date().getMonth() - 1)),
      expireDateMoment: moment(new Date().setFullYear(new Date().getFullYear() + 20))
    })
  }

  const handleFinish = async () => {
    const formData = generateCertificateForm.getFieldsValue()
    await generateCertificateForm.validateFields()

    const { name, caId, expireDateMoment, startDateMoment, generation, ...rest } = formData
    let payload = {
      ...rest
    }
    if (generation === CertificateGenerationType.NEW) {
      payload = {
        name,
        commonName: name,
        ...payload,
        notAfterDate: expireDateMoment.startOf('day').toDate(),
        notBeforeDate: startDateMoment.startOf('day').toDate()
      }
      const res = await generateClientServerCertificate({ payload, params: { caId } }).unwrap()
      return res?.response?.id
    } else if(generation === CertificateGenerationType.WITH_CSR) {
      payload = {
        name,
        ...payload,
        notAfterDate: expireDateMoment.startOf('day').toDate(),
        notBeforeDate: startDateMoment.startOf('day').toDate()
      }
      const res = await generateClientServerCertificate({ payload, params: { caId } }).unwrap()
      return res?.response?.id
    } else {
      const uploadCertData = new FormData()
      if (formData.publicKey) uploadCertData.append('certificateFile',
        new Blob([formData.publicKey.file], { type: formData.publicKey.file.type }))
      if (formData.privateKey) uploadCertData.append('privateKeyFile',
        new Blob([formData.privateKey.file], { type: formData.privateKey.file.type }))
      if (formData.name) uploadCertData.append('name', formData.name)
      if (formData.password) uploadCertData.append('password', formData.password)

      const res = await uploadCertificate({
        payload: uploadCertData,
        customHeaders: { 'Content-Type': undefined }
      }).unwrap()
      return res?.response?.id
    }
  }

  return {
    generateCertificateForm,
    resetFormFeilds,
    handleFinish
  }
}