import { useEffect, useState } from 'react'

import { Button, Col, Divider, Form, Row } from 'antd'
import { useIntl }                         from 'react-intl'

import { Collapse, Drawer, Loader }                                                                                                                                           from '@acx-ui/components'
import { CollapseActive, CollapseInactive }                                                                                                                                   from '@acx-ui/icons'
import { MAX_CERTIFICATE_PER_TENANT, UploadCaSettings }                                                                                                                       from '@acx-ui/rc/components'
import { useGetAdaptivePolicySetQuery, useGetCertificateAuthorityQuery, useGetCertificateTemplateQuery, useGetSubCertificateAuthoritiesQuery, useUploadCaPrivateKeyMutation } from '@acx-ui/rc/services'
import { Certificate, CertificateAuthority, CertificateCategoryType }                                                                                                         from '@acx-ui/rc/utils'
import { noDataDisplay }                                                                                                                                                      from '@acx-ui/utils'

import { certDetailTitle }                                                                                                    from '../contentsMap'
import { CollapsePanelContentWrapper, CollapseTitle, CollapseWrapper, Description, DescriptionRow, DescriptionText, RawInfo } from '../styledComponents'

import { getCertificateAuthorityDetails, getCertificateDetails } from './DetailDrawerHelper'
import DownloadSection                                           from './DownloadSection'

interface DetailDrawerProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
  data: Certificate | CertificateAuthority | null;
  type: CertificateCategoryType;
}

export enum RenderType {
  TITLE_WITH_DETAILS,
  TITLE,
  CONTENT,
  CONTENT_WITH_DETAILS,
  DIVIDER,
  DOWNLOAD
}

export interface Content {
  type: RenderType;
  title: string;
  content: SubContent[] | CertificateCategoryType | JSX.Element;
}

export interface SubContent {
  type: RenderType;
  title?: string;
  content?: string | JSX.Element | number | null;
  detailTitle?: string;
  detail?: string;
}

export default function DetailDrawer ({ open = false, setOpen, data, type }: DetailDrawerProps) {
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

  const { policySetId, isCertDataFetching } = useGetCertificateTemplateQuery({
    params: { policyId: (data as Certificate)?.certificateTemplateId }
  }, {
    skip: type === CertificateCategoryType.CERTIFICATE_AUTHORITY
      // eslint-disable-next-line max-len
      || (type === CertificateCategoryType.CERTIFICATE && !(data as Certificate)?.certificateTemplateId),
    selectFromResult: ({ data, isFetching }) =>
      ({ policySetId: data?.policySetId, isCertDataFetching: isFetching })
  })

  const { policySetData } = useGetAdaptivePolicySetQuery({
    params: { policySetId: policySetId }
  }, {
    skip: !policySetId,
    selectFromResult: ({ data, isUninitialized }) =>
      ({ policySetData: isUninitialized ? noDataDisplay : data?.name || noDataDisplay })
  })

  const { subCas, isCaDataFetching } = useGetSubCertificateAuthoritiesQuery({
    params: { caId: data?.id },
    payload: { pageSize: MAX_CERTIFICATE_PER_TENANT, page: 1 }
  }, {
    skip: type === CertificateCategoryType.CERTIFICATE
      || (type === CertificateCategoryType.CERTIFICATE_AUTHORITY && !data?.id),
    selectFromResult: ({ data, isFetching }) => ({
      subCas: data?.data.map(d => d.commonName) || [],
      isCaDataFetching: isFetching
    })
  })

  const { parentCaName } = useGetCertificateAuthorityQuery(
    { params: { caId: (data as CertificateAuthority)?.parentCaId } },
    {
      skip: type === CertificateCategoryType.CERTIFICATE
        // eslint-disable-next-line max-len
        || (type === CertificateCategoryType.CERTIFICATE_AUTHORITY && !(data as CertificateAuthority)?.parentCaId),
      selectFromResult: ({ data, isUninitialized }) => (
        { parentCaName: isUninitialized ? noDataDisplay : (data?.name || noDataDisplay) })
    })

  const setRawInfoDrawer = (title: string = '', data: string = '', open: boolean) => {
    setRawInfoDrawerData(data)
    setRawInfoDrawerTitle(title)
    setRawInfoDrawerOpen(open)
  }

  const getDetails = () => {
    if (type === CertificateCategoryType.CERTIFICATE) {
      const certificateData = data as Certificate
      return getCertificateDetails(certificateData, policySetData)
    } else if (type === CertificateCategoryType.CERTIFICATE_AUTHORITY) {
      const certificateAuthorityData = data as CertificateAuthority
      return getCertificateAuthorityDetails(certificateAuthorityData, parentCaName, subCas)
    } else {
      return []
    }
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
          type={item.content as CertificateCategoryType}
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
          isLoading: false,
          isFetching: isCertDataFetching || isCaDataFetching
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
              ))}
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