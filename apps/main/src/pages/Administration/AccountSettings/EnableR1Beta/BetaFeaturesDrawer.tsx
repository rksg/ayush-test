import { List }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer }                              from '@acx-ui/components'
import { BetaListDetails as betaList, useGetBetaList } from '@acx-ui/feature-toggle'
import { CaretRightList }                              from '@acx-ui/icons'

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
  const betaListFeatureIds = useGetBetaList()
  const showBetaList = betaListFeatureIds.length > 0
  if (betaListFeatureIds) {
    Object.keys(betaList).map(k2 => {
      // console.log(betaList[c].key, betaListFeatureIds.includes(betaList[c].key), betaList[c].status)
      betaList[Number(k2)].status =
        (betaListFeatureIds.includes(betaList[Number(k2)].key))? true : false
    })
  }

  const footer =<div>
    <Button type='primary'
      onClick={() => {
        setVisible(false)
      }}>
      {$t({ defaultMessage: 'Ok' })}
    </Button>
  </div>
  return ( showBetaList ? <Drawer
    title={$t({ defaultMessage: 'RUCKUS One Beta Features' })}
    visible={visible}
    onClose={onClose}
    width={props.width}
    children={
      <UI.ListWrapper>
        <List
          split={false}
          size='small'
          dataSource={betaList}
          renderItem={(item) =>
            <List.Item id={item.key}>
              {item.status &&
                <List.Item.Meta
                  avatar={<CaretRightList/>}
                  title={$t(item.description)}
                />
              }
            </List.Item>
          }
        />
      </UI.ListWrapper>
    }
    footer={footer}
  /> : <Drawer
    title={$t({ defaultMessage: 'RUCKUS One Beta Features' })}
    visible={visible}
    onClose={onClose}
    width={props.width}
    children={
      <UI.ListWrapper>
        <p>{$t({ defaultMessage: 'No beta features to show' })} </p>
      </UI.ListWrapper>
    }
    footer={footer}
  />

  )
}

export default BetaFeaturesDrawer

