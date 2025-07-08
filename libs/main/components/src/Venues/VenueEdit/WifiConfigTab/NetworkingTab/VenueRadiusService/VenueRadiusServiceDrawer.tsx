import { useIntl } from 'react-intl'

import { Drawer }        from '@acx-ui/components'
import { AAAForm }       from '@acx-ui/rc/components'
import { AAAPolicyType } from '@acx-ui/rc/utils'

type VenueRadiusServiceDrawerProps = {
    visible: boolean,
    type: string,
    onClose: () => void,
    updateInstance: (value: AAAPolicyType) => void
}

export const VenueRadiusServiceDrawer = (props: VenueRadiusServiceDrawerProps) => {
  const { $t } = useIntl()

  const { visible, type, onClose, updateInstance } = props
  const getContent = <AAAForm networkView={true}
    edit={false}
    type={type}
    forceDisableRadsec={true}
    backToNetwork={(data)=>{
      onClose()
      if (data) {
        updateInstance?.(data)
      }
    }}/>

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add AAA Server' })}
      visible={visible}
      mask={true}
      children={getContent}
      destroyOnClose={true}
      onClose={onClose}
      width={500}
      footer={<div />} // ACX-83553: Prevent parent drawer from closing when this drawer is open
    />
  )

}