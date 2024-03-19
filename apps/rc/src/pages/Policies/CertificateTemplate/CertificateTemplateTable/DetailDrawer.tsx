import { useEffect, useState } from 'react'

import { Button, Col, Divider, Form, Row } from 'antd'
import { useIntl }                         from 'react-intl'

import { Collapse, Drawer, Loader }                                                                                                                                                           from '@acx-ui/components'
import { CollapseActive, CollapseInactive }                                                                                                                                                   from '@acx-ui/icons'
import { MAX_CERTIFICATE_PER_TENANT, UploadCaSettings }                                                                                                                                       from '@acx-ui/rc/components'
import { useLazyGetAdaptivePolicySetQuery, useLazyGetCertificateAuthorityQuery, useLazyGetCertificateTemplateQuery, useLazyGetSubCertificateAuthoritiesQuery, useUploadCaPrivateKeyMutation } from '@acx-ui/rc/services'
import { Certificate, CertificateAuthority, CertificateCategoryType }                                                                                                                         from '@acx-ui/rc/utils'
import { noDataDisplay }                                                                                                                                                                      from '@acx-ui/utils'

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
  content: SubContent[] | CertificateCategoryType | JSX.Element[] | JSX.Element;
}

export interface SubContent {
  type: RenderType;
  title?: string;
  content?: string | JSX.Element[] | JSX.Element | number | null;
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
  const [getCertificateTemplate] = useLazyGetCertificateTemplateQuery()
  const [queryPolicySet] = useLazyGetAdaptivePolicySetQuery()
  const [querySubCAs] = useLazyGetSubCertificateAuthoritiesQuery()
  const [queryCAs] = useLazyGetCertificateAuthorityQuery()
  const [uploadPrivateKey] = useUploadCaPrivateKeyMutation()
  const [subCas, setSubCas] = useState(new Array<string>())
  const [parentCaName, setParentCaName] = useState<string | null>(null)
  const [policySetData, setPolicySetData] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)


  useEffect(() => {
    const fetchAndSetPolicySetData = async (data: Certificate) => {
      try {
        if (!data?.certificateTemplateId) return
        setIsFetching(true)
        const templateRes = await getCertificateTemplate({
          params: { policyId: data.certificateTemplateId }
        })
        if (templateRes?.data?.policySetId) {
          const policySetRes = await queryPolicySet({
            params: { policySetId: templateRes?.data?.policySetId }
          }).unwrap()
          setPolicySetData(policySetRes?.name || noDataDisplay)
        }
        setIsFetching(false)
      } catch {
        setIsFetching(false)
        setPolicySetData(null)
      }
    }

    const fetchAndSetSubCas = async (data: CertificateAuthority) => {
      try {
        setIsFetching(true)
        const subCAsRes = await querySubCAs({
          params: { caId: data.id },
          payload: { pageSize: MAX_CERTIFICATE_PER_TENANT, page: 1 }
        }).unwrap()
        setSubCas(subCAsRes.data?.map(d => d.commonName))
        setIsFetching(false)
      } catch {
        setIsFetching(false)
        setSubCas([])
      }
    }

    const fetchAndSetParentCa = async (data: CertificateAuthority) => {
      if (!data.parentCaId) {
        setParentCaName(null)
        return
      }
      try {
        const parentCaRes = await queryCAs({ params: { caId: data.parentCaId } }).unwrap()
        setParentCaName(parentCaRes.name)
      } catch {
        setParentCaName(null)
      }
    }

    setRawInfoDrawerOpen(false)
    setUploadDrawerOpen(false)
    uploadPrivateKeyForm.resetFields()
    if (data && type === CertificateCategoryType.CERTIFICATE) {
      fetchAndSetPolicySetData(data as Certificate)
    } else if (data && type === CertificateCategoryType.CERTIFICATE_AUTHORITY) {
      fetchAndSetSubCas(data as CertificateAuthority)
      fetchAndSetParentCa(data as CertificateAuthority)
    }
  }, [data])

  const getTitle = () => {
    return type === CertificateCategoryType.CERTIFICATE ?
      $t({ defaultMessage: 'Certificate Details' }) :
      $t({ defaultMessage: 'Certificate Authority Details' })
  }

  const getCollapsedHeader = (header: string) => < CollapseTitle >{header}</CollapseTitle >
  const setRawInfoDrawer = (title: string | undefined, data: string | undefined, open: boolean) => {
    setRawInfoDrawerData(data || '')
    setRawInfoDrawerTitle(title || '')
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
        return (
          <>{Array.isArray(item.content) && item.content.map(renderItemContent)}</>
        )
      case RenderType.TITLE_WITH_DETAILS:
        return <>{item.content}</>
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
        title={getTitle()}
        visible={open}
        onClose={() => setOpen(false)}
        width={550}
        destroyOnClose={true}
      >
        <Loader states={[{ isLoading: false, isFetching }]}>
          <CollapseWrapper>
            <Collapse
              className='site-collapse-custom-collapse'
              expandIcon={({ isActive }) => isActive ?
                <CollapseInactive width={10} /> : <CollapseActive width={10} />}
              ghost
            >
              {getDetails().map((item, index) => (
                <Collapse.Panel header={getCollapsedHeader(item.title)}
                  key={index}
                  className='site-collapse-custom-panel'>
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
        children={<> <Form layout='vertical' form={uploadPrivateKeyForm}>
          <UploadCaSettings showPublicKeyUpload={false} />
        </Form></>}
      />
    </>
  )
}