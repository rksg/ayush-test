export interface IdentityProviderProfileViewData {
    id: string
    name: string
    authnRequestSignedEnabled: boolean
    responseEncryptionEnabled: boolean
    serverCertificateId: string
    wifiNetworkIds: string[]
}

export interface IdentityProviderProfile {
    id: string
    name: string
    metadata: string
    authnRequestSignedEnabled: boolean
}

export interface IdentityProviderProfileFormType extends IdentityProviderProfile {
    responseEncryptionEnabled: boolean
    serverCertificateId: string
}