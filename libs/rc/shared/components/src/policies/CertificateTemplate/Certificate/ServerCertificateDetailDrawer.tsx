import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Collapse, Drawer, Loader }                   from '@acx-ui/components'
import { CollapseActive, CollapseInactive }           from '@acx-ui/icons'
import { CertificateCategoryType, ServerCertificate } from '@acx-ui/rc/utils'

import { certDetailTitle }          from '../contentsMap'
import { CollapseWrapper, RawInfo } from '../styledComponents'

import DownloadSection from './DownloadSection'

interface DetailDrawerProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
  data: ServerCertificate | null;
}

export function ServerCertificateDetailDrawer (
  { open = false, setOpen, data }: DetailDrawerProps) {
  const { $t } = useIntl()
  const [rawInfoDrawerOpen, setRawInfoDrawerOpen] = useState(false)
  const [rawInfoDrawerData, setRawInfoDrawerData] = useState('')
  const [rawInfoDrawerTitle, setRawInfoDrawerTitle] = useState('')

  useEffect(() => {
    setRawInfoDrawerOpen(false)
  }, [data])

  const setRawInfoDrawer = (title: string = '', data: string = '', open: boolean) => {
    setRawInfoDrawerData(data)
    setRawInfoDrawerTitle(title)
    setRawInfoDrawerOpen(open)
  }

  return (
    <>
      <Drawer
        title={$t(certDetailTitle[CertificateCategoryType.SERVER_CERTIFICATES])}
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
              <DownloadSection
                type={CertificateCategoryType.SERVER_CERTIFICATES}
                data={data}
                setRawInfoDrawer={setRawInfoDrawer}
                setUploadDrawerOpen={()=>{}} />
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
    </>
  )
}