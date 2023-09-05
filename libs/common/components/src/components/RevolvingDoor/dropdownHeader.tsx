import React from 'react'

import {
  Breadcrumb
} from 'antd'
import { useIntl } from 'react-intl'

import { customCapitalize } from './helpers'
import * as UI              from './styledComponents'

import { Node } from '.'

interface DropdownHeaderProps {
  breadcrumb: Node[];
  searchText: string;
  currentNode: Node;
  onBack: () => void;
  onBreadcrumbClick: (index: number) => void;
}

export const DropdownHeader: React.FC<DropdownHeaderProps> = ({
  breadcrumb,
  searchText,
  currentNode,
  onBack,
  onBreadcrumbClick
}) => (
  <>
    <UI.ListHeader onClick={onBack}>
      {breadcrumb.length > 1 && !searchText && <UI.LeftArrow />}
      <UI.LeftArrowText hasLeftArrow={!Boolean(breadcrumb.length > 1 && !searchText)}>
        {searchText
          // eslint-disable-next-line react-hooks/rules-of-hooks
          ? useIntl().$t({ defaultMessage: 'Search Results' })
          : customCapitalize(currentNode)}
      </UI.LeftArrowText>
    </UI.ListHeader>
    <UI.StyledBreadcrumb>
      {!searchText &&
        breadcrumb.map((node, index) => (
          <Breadcrumb.Item key={index} onClick={() => onBreadcrumbClick(index)}>
            {index !== breadcrumb.length - 1
              ? customCapitalize(node)
              : ''}
          </Breadcrumb.Item>
        ))}
    </UI.StyledBreadcrumb>
  </>
)