/**
 * Modify antd variables
 * https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
 *
 * Notes:
 * - Use var(--acx-*) for colors and typography unless there are compile issues
 * - Sort alphanumerically to make it easier to locate variables
 */

module.exports = {
  '@badge-status-size': '8px',

  '@body-background': 'var(--acx-neutrals-5)',

  '@border-radius-base': '4px',

  '@breadcrumb-base-color': 'var(--acx-primary-black)',
  '@breadcrumb-last-item-color': 'var(--acx-primary-black)',
  '@breadcrumb-font-size': 'var(--acx-body-4-font-size)',
  '@breadcrumb-link-color': 'var(--acx-accents-orange-50)',
  '@breadcrumb-link-color-hover': 'var(--acx-accents-orange-60)',
  '@breadcrumb-separator-color': 'var(--acx-primary-black)',
  '@breadcrumb-separator-margin': '0 5px',

  '@btn-default-border': 'var(--acx-primary-black)',
  '@btn-font-size-lg': '16px', // var(--acx-body-2-font-size)
  '@btn-font-size-sm': '12px', // var(--acx-body-3-font-size)
  '@btn-primary-bg': 'var(--acx-primary-black)',

  '@card-background': 'var(--acx-primary-white)',

  '@component-background': 'var(--acx-neutrals-5)',

  '@font-family': 'var(--acx-neutral-brand-font)',
  '@font-size-base': '14px', // var(--acx-body-3-font-size)
  '@font-size-lg': '16px', // var(--acx-body-2-font-size)
  '@font-size-sm': '12px', // var(--acx-body-4-font-size)

  '@form-item-label-font-size': 'var(--acx-body-4-font-size)',
  '@form-vertical-label-padding': '0 0 4px',

  '@heading-1-size': 'var(--acx-headline-1-font-size)',
  '@heading-2-size': 'var(--acx-headline-2-font-size)',
  '@heading-3-size': 'var(--acx-headline-3-font-size)',
  '@heading-4-size': 'var(--acx-headline-4-font-size)',
  '@heading-5-size': 'var(--acx-headline-5-font-size)',
  '@heading-color': 'var(--acx-primary-black)',

  '@input-border-color': 'var(--acx-neutrals-50)',
  '@input-hover-border-color': 'var(--acx-accents-orange-50)',

  '@label-color': 'var(--acx-neutrals-60)',

  '@layout-body-background': 'var(--acx-primary-black)',
  '@layout-sider-background': 'var(--acx-primary-black)',

  '@line-height-base': '1.33',

  '@link-active-color': 'var(--acx-accents-blue-80)',
  '@link-color': 'var(--acx-accents-blue-50)',
  '@link-hover-color': 'var(--acx-accents-orange-50)',

  '@menu-dark-bg': '#333333', //var(--acx-primary-black)'
  '@menu-dark-color': 'var(--acx-primary-white)',
  '@menu-dark-item-active-bg': 'var(--acx-neutrals-70)',

  '@message-notice-content-padding': '10px 24px',

  '@page-header-tabs-tab-font-size': 'var(--acx-headline-4-font-size)',

  '@primary-color-active': 'var(--acx-neutrals-50)',
  '@primary-color': '#EC7100', // var(--acx-accents-orange-50)

  '@screen-xl': '1280px',
  '@screen-xxl': '1920px',

  '@table-padding-vertical': '14px',
  '@table-padding-horizontal': '8px',

  '@tabs-highlight-color': 'var(--acx-primary-black)',
  '@tabs-hover-color': 'var(--acx-accents-orange-50)',
  '@tabs-active-color': 'var(--acx-primary-black)',
  '@tabs-horizontal-gutter': '18px',
  '@tabs-horizontal-padding': '0px',

  '@text-color': 'var(--acx-primary-black)',
  '@text-selection-bg': 'var(--acx-neutrals-60)',

  '@radio-dot-color': 'var(--acx-accents-blue-50)',

  '@tooltip-arrow-width': '14px',
  '@tooltip-distance': '@tooltip-arrow-width - 2px',
  '@tooltip-color': 'var(--acx-primary-black)',
  '@tooltip-bg': 'var(--acx-primary-white)',

  '@switch-min-width': '28px',
  '@switch-height': '16px',
  '@switch-pin-size': '10px',
  '@switch-padding': '2px',

  '@checkbox-color': 'var(--acx-accents-blue-50)',
  '@checkbox-check-color': 'var(--acx-primary-white)',
  '@checkbox-border-radius': '2px'
}
