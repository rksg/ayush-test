import { useState } from 'react'

import { Space, Typography } from 'antd'
import { useIntl }           from 'react-intl'

import { Button, cssNumber } from '@acx-ui/components'

import { CompatibilityError, CompatibilityErrorDetails } from '../CompatibilityErrorDetails'
import { SingleNodeDetailsField }                        from '../CompatibilityErrorDetails/SingleNodeDetails'

import * as UI from './styledComponents'

export enum CompatibilityStatusEnum {
  PASS = 'PASS',
  FAIL = 'FAIL'
}

interface CompatibilityStatusBarProps {
  type: CompatibilityStatusEnum,
  fields: SingleNodeDetailsField[],
  errors?: CompatibilityError[]
}

export const CompatibilityStatusBar = (props: CompatibilityStatusBarProps) => {
  const { type, fields, errors } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState<boolean>(false)

  const handleDetailOnClick = () => setVisible(true)

  return <>
    <Space size={cssNumber('--acx-modal-footer-small-padding-left')}>
      <UI.Title children={$t({ defaultMessage: 'Nodes Compatibility Check' })} />
      <UI.AlertMessageWrapper type={type}>
        { type === CompatibilityStatusEnum.PASS
          ? <UI.CheckMarkIcon/>
          : <UI.FailedSolidIcon />
        }
        <Typography.Text children={$t({
          defaultMessage: '{value, select, true {Pass} other {Mismatch}}'
        }, { value: type === CompatibilityStatusEnum.PASS })} />
      </UI.AlertMessageWrapper>
      { type === CompatibilityStatusEnum.FAIL &&
        <Button
          type='link'
          onClick={handleDetailOnClick}
          children={$t({ defaultMessage: 'See details' })} />
      }
    </Space>
    <CompatibilityErrorDetails
      visible={visible}
      setVisible={setVisible}
      fields={fields}
      data={errors ?? []}
    />
  </>
}