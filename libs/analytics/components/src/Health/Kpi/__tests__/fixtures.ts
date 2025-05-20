import { Settings } from '@acx-ui/analytics/utils'

export const defaultTenantSettings = {
  'brand-name': 'testBrand',
  'lsp-name': 'testLsp',
  'property-name': 'testProperty'
} as unknown as Settings

export const intentFeatureSettingsWithoutEnergySaving = {
  ...defaultTenantSettings,
  'enabled-intent-features': ['AI-Driven RRM', 'EquiFlex', 'AI Operations']
} as unknown as Settings

export const energySavingSettings = {
  ...defaultTenantSettings,
  'enabled-intent-features': ['AI-Driven RRM', 'EquiFlex', 'AI Operations', 'Energy Saving']
} as unknown as Settings