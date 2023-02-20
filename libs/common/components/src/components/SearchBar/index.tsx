import React from 'react'

import { useIntl } from 'react-intl'

import { SearchOutlined } from '@acx-ui/icons'

import { Input } from './styledComponents'

function SearchBar (props: { onChange: (value: string) => void, placeHolder?: string }) {
  const { onChange, placeHolder } = props
  const defaultPlaceHolder = useIntl().$t({ defaultMessage: 'Search for...' })
  return <Input
    placeholder={placeHolder || defaultPlaceHolder}
    prefix={<SearchOutlined />}
    onChange={({ target: { value } }) => onChange(value)}
    allowClear
  />
}

export { SearchBar }
