export type Role = "member" | "scanner" | "admin"
export type OrgType = "acme-corp" | "tech-events" | "fitness-club"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  organization: OrgType
  avatar?: string
}

export interface Stamp {
  id: string
  eventId: string
  eventName: string
  eventDate: string
  scannedAt: string
  location: string
}

export interface Passport {
  id: string
  memberId: string
  stamps: Stamp[]
  createdAt: string
}

export interface Event {
  id: string
  name: string
  date: string
  location: string
  organizationId: OrgType
  description?: string
}

export interface Org {
  id: OrgType
  name: string
  logo?: string
}
