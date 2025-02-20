import { useState } from 'react'

import { Form, Space }  from 'antd'
import { FormInstance } from 'antd/es/form/Form'
import { useIntl }      from 'react-intl'

import { Button, Drawer }  from '@acx-ui/components'
import { CertificateUrls } from '@acx-ui/rc/utils'
import { getOpsApi }       from '@acx-ui/utils'

import CertificateAuthoritySettings from '../CertificateAuthorityForm/CertificateAuthoritySettings/CertificateAuthoritySettings'
import useCertificateAuthorityForm  from '../CertificateAuthorityForm/useCertificateAuthorityForm'



interface AddCertificateAuthorityDrawerProps {
  certificateTemplateForm: FormInstance
}

export default function AddCertificateAuthorityDrawer (props: AddCertificateAuthorityDrawerProps) {
  const { certificateTemplateForm } = props
  const { $t } = useIntl()
  const [open, setOpen] = useState(false)
  const {
    createCaForm,
    resetCaFormFeilds,
    handleFinish
  } = useCertificateAuthorityForm()

  return (
    <>
      <Space align='center'>
        <Button
          type='link'
          onClick={() => setOpen(true)}
          style={{ marginLeft: '8px', top: '0.25rem' }}
          rbacOpsIds={[
            getOpsApi(CertificateUrls.addCA),
            getOpsApi(CertificateUrls.addSubCA),
            getOpsApi(CertificateUrls.uploadCAPrivateKey)

          ]}
        >
          {$t({ defaultMessage: 'Add' })}
        </Button>
      </Space >
      <Drawer
        title={$t({ defaultMessage: 'Add Certificate Authority' })}
        visible={open}
        onClose={() => setOpen(false)}
        destroyOnClose={true}
        width={550}
        footer={
          <Drawer.FormFooter
            showAddAnother={false}
            showSaveButton={true}
            onCancel={
              () => {
                setOpen(false)
              }
            }
            onSave={async () => {
              try {
                const createdCaId = await handleFinish()
                certificateTemplateForm.setFieldValue(
                  ['onboard', 'certificateAuthorityId'], createdCaId)
                resetCaFormFeilds()
                setOpen(false)
              } catch (ignore) { }
            }}
          />
        }
      >
        <Form layout='vertical' form={createCaForm}>
          <CertificateAuthoritySettings />
        </Form>
      </Drawer>
    </>

  )
}
