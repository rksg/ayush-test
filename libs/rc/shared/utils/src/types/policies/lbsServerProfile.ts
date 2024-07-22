export interface LbsServerProfileViewModel {
    id: string
    name: string
    lbsVenueName: string
    server: string
    venueIds?: string[]
    isServerConnected?: boolean
}

export interface LbsServerProfile {
    id: string
    name: string
    lbsVenueName: string
    serverAddress: string
    serverPort: number
    password: string
}

export interface LbsServerProfileContext {
    id?: string,
    profileName: string,
}

export interface LbsServerProfileDetailContextType {
    filtersId: string[],
    profileName: string,
    setFiltersId: (filtersId: string[]) => void
    setProfileName: (profileName: string) => void
}