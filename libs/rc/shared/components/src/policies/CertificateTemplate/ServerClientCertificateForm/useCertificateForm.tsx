import { useEffect } from 'react'

import { Form } from 'antd'
import moment   from 'moment'

import { useGenerateClientServerCertificatesMutation } from '@acx-ui/rc/services'
import { AlgorithmType, CertificateGenerationType }    from '@acx-ui/rc/utils'

export default function useCertificateForm () {
  const [generateCertificateForm] = Form.useForm()
  const [generateClientServerCertificate] = useGenerateClientServerCertificatesMutation()

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

    const { name, caId, expireDateMoment, startDateMoment, generation, email, ...rest } = formData
    const payload = {
      ...rest,
      commonName: name,
      notAfterDate: expireDateMoment.startOf('day').toDate(),
      notBeforeDate: startDateMoment.startOf('day').toDate(),
      email: email ? email : undefined
    }
    if (generation === CertificateGenerationType.NEW) {
      const res = await generateClientServerCertificate({ payload, params: { caId } }).unwrap()
      return res?.response?.id
    }
    return null
  }

  return {
    generateCertificateForm,
    resetFormFeilds,
    handleFinish
  }
}