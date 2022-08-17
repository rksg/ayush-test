import React from 'react'

import { useIntl } from 'react-intl'

import { SearchOutlined } from '@acx-ui/icons'

import { Input } from './styledComponents'

function SearchBar (props: { onChange: (value: string) => void }) {
  return <Input
    placeholder={useIntl().$t({ defaultMessage: 'Search for...' })}
    prefix={<SearchOutlined />}
    onChange={({ target: { value } }) => props.onChange(value)}
  />
}

export { SearchBar }
