import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Loader, cssStr }                                   from '@acx-ui/components'
import {  ApCompatibility, Compatibility, IncompatibilityFeatures } from '@acx-ui/rc/utils'

import { FeatureCrossDeviceTypeCompatibility } from '../../CompatibilityDrawer/FeatureCrossDeviceTypeCompatibility'

export type EdgeDetailCompatibilityDrawerProps = {
  visible: boolean,
  featureName: IncompatibilityFeatures,
  data: Record<string, ApCompatibility | Compatibility>,
  onClose: () => void,
  title?: string,
  isLoading?: boolean,
}

export const EdgeDetailCompatibilityDrawer = (props: EdgeDetailCompatibilityDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    featureName,
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
        <Form layout='vertical' style={{ paddingBottom: cssStr('--acx-content-vertical-space') }}>
          <FeatureCrossDeviceTypeCompatibility
            data={data}
            featureName={featureName}
          />
        </Form>
      </Loader>
    </Drawer>
  )
}