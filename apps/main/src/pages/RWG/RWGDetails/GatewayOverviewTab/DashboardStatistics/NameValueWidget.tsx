import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { GridCol, GridRow } from '@acx-ui/components'

import * as UI from '../styledComponents'

export default function NameValueWidget (props: { name: string, value: number, unit: string }) {

  const { name, value, unit } = props

  const { $t } = useIntl()
  return <GridRow>
    <GridCol col={{ span: 24 }} style={{ alignItems: 'center' }}>
      <UI.TopTitle>
        {$t({ defaultMessage: '{name}' }, { name })}
      </UI.TopTitle>
      <UI.Wrapper style={{ justifyContent: 'center' }}>
        <UI.LargePercent>
          { value }
          <Typography.Title level={3}>
            {$t({ defaultMessage: ' {unit}' }, { unit })}
          </Typography.Title>
        </UI.LargePercent>
      </UI.Wrapper>
    </GridCol>
  </GridRow>
}