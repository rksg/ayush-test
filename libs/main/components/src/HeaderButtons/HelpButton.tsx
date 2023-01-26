import { Menu, Dropdown } from 'antd'
import { useIntl }        from 'react-intl'

import { Tooltip }                 from '@acx-ui/components'
import { QuestionMarkCircleSolid } from '@acx-ui/icons'
import { notAvailableMsg }         from '@acx-ui/utils'

import { DisabledButton } from './styledComponents'

const HelpButton = () => {
  const { $t } = useIntl()

  const menuHeaderDropdown = (
    <Menu selectedKeys={[]}>
      <Menu.Item disabled key='documentation'>
        {$t({ defaultMessage: 'Documentation Center' })}
      </Menu.Item>

      <Menu.Item disabled key='videos'>
        {$t({ defaultMessage: 'How-To Videos' })}
      </Menu.Item>

      <Menu.Item disabled key='help'>
        {$t({ defaultMessage: 'Help for this page' })}
      </Menu.Item>

      <Menu.Item disabled key='models'>
        {$t({ defaultMessage: 'Supported Device Models' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item disabled key='openCases'>
        {$t({ defaultMessage: 'My Open Cases' })}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item disabled key='privacy'>
        {$t({ defaultMessage: 'Privacy' })}
      </Menu.Item>
    </Menu>
  )

  return (<>
    <Dropdown disabled overlay={menuHeaderDropdown} trigger={['click']} placement='bottomLeft'>
      <Tooltip title={useIntl().$t(notAvailableMsg)}>
        <DisabledButton disabled icon={<QuestionMarkCircleSolid />} />
      </Tooltip>
    </Dropdown>
  </>
  )
}

export default HelpButton
