import { List, Typography } from 'antd'
import { useIntl }          from 'react-intl'

import { Button, Drawer }    from '@acx-ui/components'
import { CaretRightList } from '@acx-ui/icons'

import * as UI from './styledComponents'

/* eslint-disable-next-line */
export interface BetaFeaturesDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  onClose: () => void
  width?: number
}

export function BetaFeaturesDrawer (
  props: BetaFeaturesDrawerProps
) {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  const onClose = () => {
    setVisible(false)
  }

  // eslint-disable-next-line max-len
  const sectionTitle = $t({ defaultMessage: 'Current RUCKUS One beta features: ' })
  const betaList = [
    { key: 'AP-CCD', desc: $t({ defaultMessage: 'AP-CCD beta feature' }), status: true },
    { key: 'AP-70', desc: $t({ defaultMessage: 'AP-70 beta faeture' }), status: true },
    { key: 'AP-NEIGHBORS', desc: $t({ defaultMessage: 'AP-NEIGHBORS beta feature' }),
      status: true },
    { key: 'PLCY-EDGE', desc: $t({ defaultMessage: 'PLCY-EDGE beta feature' }), status: false }
  ]

  const footer =<div>
    <Button type='primary'
      onClick={() => {
        setVisible(false)
      }}>
      {$t({ defaultMessage: 'Ok' })}
    </Button>
  </div>

  return <Drawer
    title={$t({ defaultMessage: 'R1 Beta Features' })}
    visible={visible}
    onClose={onClose}
    width={props.width}
    children={
      <UI.ListWrapper>
        <UI.SectionTitle>{sectionTitle}</UI.SectionTitle>
        <List
          split={false}
          size='small'
          dataSource={betaList}
          renderItem={(item) =>
            <List.Item id={item.key}>
                {item.status &&
                  <List.Item.Meta
                    avatar={<CaretRightList />}
                    title={item.desc}
                  />
                }
            </List.Item>
          }
        />
      </UI.ListWrapper>
    }
    footer={footer}
  />
}

export default BetaFeaturesDrawer

