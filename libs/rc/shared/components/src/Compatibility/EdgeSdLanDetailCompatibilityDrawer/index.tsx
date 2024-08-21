import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Loader }                            from '@acx-ui/components'
import {  ApCompatibility, IncompatibilityFeatures } from '@acx-ui/rc/utils'

import { FeatureCrossDeviceTypeCompatibility } from '../CompatibilityDrawer'

export type EdgeSdLanDetailCompatibilityDrawerProps = {
  visible: boolean,
  data: Record<string, ApCompatibility>,
  onClose: () => void,
  title?: string,
  isLoading?: boolean,
}

// eslint-disable-next-line max-len
export const EdgeSdLanDetailCompatibilityDrawer = (props: EdgeSdLanDetailCompatibilityDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    title,
    isLoading = false,
    data,
    onClose
  } = props

  return (
    <Drawer
      title={title ?? $t({ defaultMessage: 'Incompatibility Details' })}
      visible={visible}
      closable={true}
      onClose={onClose}
      destroyOnClose={true}
      width={'500px'}
    >
      <Loader states={[ { isLoading } ]}>
        <Form layout='vertical'>
          <FeatureCrossDeviceTypeCompatibility
            data={data}
            featureName={IncompatibilityFeatures.SD_LAN}
          />
        </Form>
      </Loader>
    </Drawer>
  )
}