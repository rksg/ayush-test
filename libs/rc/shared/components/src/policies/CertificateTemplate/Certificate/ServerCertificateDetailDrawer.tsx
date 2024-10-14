import { useEffect, useState } from 'react'

import { Button, Col, Divider, Form, Row } from 'antd'
import { useIntl }                         from 'react-intl'

import { Collapse, Drawer, Loader }                                                      from '@acx-ui/components'
import { CollapseActive, CollapseInactive }                                              from '@acx-ui/icons'
import { useUploadCaPrivateKeyMutation }                                                 from '@acx-ui/rc/services'
import { Certificate, CertificateAuthority, CertificateCategoryType, ServerCertificate } from '@acx-ui/rc/utils'
import { TenantLink }                                                                    from '@acx-ui/react-router-dom'
import { noDataDisplay }                                                                 from '@acx-ui/utils'

import { UploadCaSettings }                                                                                                   from '../CertificateAuthorityForm/CertificateAuthoritySettings/UploadCaSettings'
import { certDetailTitle }                                                                                                    from '../contentsMap'
import { CollapsePanelContentWrapper, CollapseTitle, CollapseWrapper, Description, DescriptionRow, DescriptionText, RawInfo } from '../styledComponents'

import { RenderType, SubContent, Content } from './DetailDrawer'
import { getCertificateDetails }           from './DetailDrawerHelper'
import DownloadSection                     from './DownloadSection'

interface DetailDrawerProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
  data: ServerCertificate | null;
  type: CertificateCategoryType;
}

export function ServerCertificateDetailDrawer (
  { open = false, setOpen, data, type }: DetailDrawerProps) {
  const { $t } = useIntl()
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false)
  const [uploadPrivateKeyForm] = Form.useForm()
  const [rawInfoDrawerOpen, setRawInfoDrawerOpen] = useState(false)
  const [rawInfoDrawerData, setRawInfoDrawerData] = useState('')
  const [rawInfoDrawerTitle, setRawInfoDrawerTitle] = useState('')
  const [uploadPrivateKey] = useUploadCaPrivateKeyMutation()

  useEffect(() => {
    setRawInfoDrawerOpen(false)
    setUploadDrawerOpen(false)
    uploadPrivateKeyForm.resetFields()
  }, [data])

  const setRawInfoDrawer = (title: string = '', data: string = '', open: boolean) => {
    setRawInfoDrawerData(data)
    setRawInfoDrawerTitle(title)
    setRawInfoDrawerOpen(open)
  }

  const getDetails = () => {
    const certificateData = data as ServerCertificate
    return getCertificateDetails(certificateData, null)
  }

  const CollapsePanelContent = ({ data, item, setRawInfoDrawer }:
    {
      data: CertificateAuthority | Certificate | null; item: Content;
      setRawInfoDrawer: (title: string | undefined, data: string | undefined, open: boolean) => void
    }) => {
    const renderItemContent = (subItem: SubContent, subIndex: number) => {
      switch (subItem.type) {
        case RenderType.CONTENT:
          return (
            <DescriptionRow key={subIndex}>
              <Description>{subItem.title}</Description>
              <DescriptionText>{subItem.content || noDataDisplay}</DescriptionText>
            </DescriptionRow>
          )
        case RenderType.LINK:
          return (
            <DescriptionRow key={subIndex}>
              <Description>{subItem.title}</Description>
              <TenantLink to={subItem.link!}>{subItem.content || noDataDisplay}</TenantLink>
            </DescriptionRow>
          )
        case RenderType.DIVIDER:
          return <Divider key={subIndex} />
        case RenderType.CONTENT_WITH_DETAILS:
          return (
            <DescriptionRow key={subIndex}>
              <Row key={subIndex}>
                <Col span={12}>
                  <Description>{subItem.title}</Description>
                  <DescriptionText>{subItem.content || noDataDisplay}</DescriptionText>
                </Col>
                <Col span={12}>
                  <Row justify='end'>
                    <Button
                      type='link'
                      size='small'
                      onClick={() => setRawInfoDrawer(subItem.detailTitle, subItem.detail, true)}
                    >
                      {subItem.detailTitle}
                    </Button>
                  </Row>
                </Col>
              </Row>
            </DescriptionRow>
          )
        default:
          return null
      }
    }

    switch (item.type) {
      case RenderType.TITLE:
        return Array.isArray(item.content) ? <>{item.content.map(renderItemContent)}</> : null
      case RenderType.TITLE_WITH_DETAILS:
        return item.content as JSX.Element
      case RenderType.DOWNLOAD:
        return <DownloadSection
          type={CertificateCategoryType.SERVER_CERTIFICATES}
          data={data}
          setRawInfoDrawer={setRawInfoDrawer}
          setUploadDrawerOpen={setUploadDrawerOpen} />
      default:
        return null
    }
  }

  const onSaveUploadPrivateKey = async () => {
    try {
      await uploadPrivateKeyForm.validateFields()
      const formData = uploadPrivateKeyForm.getFieldsValue()
      const uploadCaData = new FormData()
      uploadCaData.append('password', formData.password)
      uploadCaData.append('privateKey', formData.privateKey.file)
      await uploadPrivateKey({
        params: { caId: data!.id },
        payload: uploadCaData,
        customHeaders: {
          'Content-Type': undefined,
          'Accept': '*/*'
        }
      }).unwrap()
    } catch (ignore) { }
  }

  return (
    <>
      <Drawer
        title={$t(certDetailTitle[type])}
        visible={open}
        onClose={() => setOpen(false)}
        width={550}
        destroyOnClose={true}
      >
        <Loader states={[{
          isLoading: false
        }]}>
          <CollapseWrapper>
            <Collapse
              expandIcon={({ isActive }) => isActive ?
                <CollapseInactive width={10} /> : <CollapseActive width={10} />}
              ghost
            >
              {getDetails().map((item, index) => (
                <Collapse.Panel header={<CollapseTitle>{item.title}</CollapseTitle>}
                  key={index}>
                  <CollapsePanelContentWrapper>
                    <CollapsePanelContent
                      data={data}
                      item={item}
                      setRawInfoDrawer={setRawInfoDrawer} />
                  </CollapsePanelContentWrapper>
                </Collapse.Panel>
              )).filter(item => item.key !== RenderType.DOWNLOAD)}
            </Collapse>
          </CollapseWrapper>
        </Loader>
      </Drawer>
      <Drawer
        title={rawInfoDrawerTitle}
        visible={rawInfoDrawerOpen}
        onClose={() => setRawInfoDrawerOpen(false)}
        destroyOnClose={true}
        width={550}
        footer={
          <Drawer.FormFooter
            onCancel={() => setRawInfoDrawerOpen(false)}
            buttonLabel={{ cancel: $t({ defaultMessage: 'OK' }) }}
          />
        }
      >
        <RawInfo>
          {rawInfoDrawerData || $t({ defaultMessage: 'No Details' })}
        </RawInfo>
      </Drawer >
      <Drawer
        forceRender
        title={$t({ defaultMessage: 'Upload Private Key' })}
        visible={uploadDrawerOpen}
        onClose={() => setUploadDrawerOpen(false)}
        destroyOnClose={true}
        width={550}
        zIndex={2000}
        footer={
          <Drawer.FormFooter
            onCancel={() => setUploadDrawerOpen(false)}
            onSave={async () => {
              await onSaveUploadPrivateKey()
              setUploadDrawerOpen(false)
            }}
          />}
        children={<Form layout='vertical' form={uploadPrivateKeyForm}>
          <UploadCaSettings showPublicKeyUpload={false} />
        </Form>}
      />
    </>
  )
}