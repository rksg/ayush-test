import { useState } from 'react'

import { Form, Col, Row, Space } from 'antd'
import { useIntl }               from 'react-intl'

import { Button, Tooltip } from '@acx-ui/components'
import { CsvSize }         from '@acx-ui/rc/components'

import { SetupAzureDrawer } from './SetupAzureDrawer'
import { ButtonWrapper }    from './styledComponents'

const AuthServerFormItem = () => {
  const { $t } = useIntl()
  const [drawerVisible, setDrawerVisible] = useState(false)

  const onSetUpValue = () => {
    setDrawerVisible(true)
  }

  // interface AuthAppProps {
  //   visible: boolean
  //   setVisible: (visible: boolean) => void
  // }

  // const SetupAzureDrawer = (props: AuthAppProps) => {
  //   const { $t } = useIntl()
  //   const { visible, setVisible } = props
  //   const [form] = Form.useForm()

  //   const onClose = () => {
  //     setVisible(false)
  //     form.resetFields()
  //   }

  //   const handleSave = () => {
  //     setVisible(false)
  //   }

  //   const footer = <Drawer.FormFooter
  //     buttonLabel={{ save: $t({ defaultMessage: 'Apply' }) }}
  //     onCancel={onClose}
  //     onSave={async () => handleSave()}
  //   />

  //   return (
  //     // <Drawer
  //     //   title={$t({ defaultMessage: 'Set Up SSO with 3rd Party Provider' })}
  //     //   visible={visible}
  //     //   onClose={onClose}
  //     //   footer={footer}
  //     //   destroyOnClose
  //     //   width={550}
  //     // >
  //     //   <Typography.Text>
  //     //     { $t({ defaultMessage: 'IdP Metadata' }) }
  //     //   </Typography.Text>
  //     //   <TextArea
  //     //     placeholder='Paste IDP metadata here...'
  //     //     style={{
  //     //       fontSize: '12px',
  //     //       resize: 'none',
  //     //       marginTop: '15px',
  //     //       height: '661px',
  //     //       borderRadius: '4px'
  //     //     }}
  //     //     autoSize={false}
  //     //     readOnly={false}
  //     //   />
  //     // </Drawer>
  //   )
  // }

  const hasSsoConfigured = false

  return ( <>
    <Row gutter={24}>
      <Col span={10}>
        <Form.Item
          colon={false}
          label={<>
            {$t({ defaultMessage: 'Enable SSO with 3rd Party provider' })}
            <Tooltip.Question
              title={$t({ defaultMessage: 'At this time, only Azure AD is officially supported' })}
              placement='right'
            />
          </>}
          children={hasSsoConfigured &&
            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
              <ButtonWrapper
                style={{ marginLeft: '10px' }}
                size={20}
              >
                <Button type='link'
                  key='editsso'
                  onClick={() => { }}>
                  {$t({ defaultMessage: 'Edit' })}
                </Button>
                <Button type='link'
                  key='deletesso'
                  onClick={() => { }}>
                  {$t({ defaultMessage: 'Delete' })}
                </Button>
              </ButtonWrapper>
            </Space>
          }
        />
        {!hasSsoConfigured &&
        <Button onClick={onSetUpValue}>{$t({ defaultMessage: 'Set Up' })}</Button>}
      </Col>
    </Row>
    {drawerVisible &&
    <SetupAzureDrawer
      visible={drawerVisible}
      title={$t({ defaultMessage: 'Set Up SSO with 3rd Party Provider' })}
      type='DPSK'
      maxSize={CsvSize['5MB']}
      maxEntries={512}
      acceptType={['csv']}
      templateLink='assets/templates/mac_registration_import_template.csv'
      // importRequest={async (formData) => {
      //   // try {
      //   //   await uploadCsv({ params: { policyId }, payload: formData }).unwrap()
      //   //   setUploadCsvDrawerVisible(false)
      //   //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //   // } catch (error) {
      //   //   console.log(error) // eslint-disable-line no-console
      //   // }
      // }}
      setVisible={setDrawerVisible}
    />}
  </>
  )
}

export { AuthServerFormItem }