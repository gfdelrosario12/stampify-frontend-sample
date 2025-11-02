import type { User, Stamp, Passport, Event, Organization as OrgType } from "./types"

export const organizations: Record<string, OrgType> = {
  "acme-corp": {
    id: "acme-corp" as any,
    name: "ACME Corporation",
    logo: "🏢",
  },
  "tech-events": {
    id: "tech-events" as any,
    name: "Tech Events Co",
    logo: "💻",
  },
  "fitness-club": {
    id: "fitness-club" as any,
    name: "Fitness Club Pro",
    logo: "💪",
  },
}

export const stamps: Stamp[] = [
  {
    id: "1",
    eventId: "ev-1",
    eventName: "Annual Conference 2024",
    eventDate: "2024-11-15",
    scannedAt: "2024-11-15T09:30:00Z",
    location: "Convention Center",
  },
  {
    id: "2",
    eventId: "ev-2",
    eventName: "Summer Workshop",
    eventDate: "2024-08-22",
    scannedAt: "2024-08-22T14:15:00Z",
    location: "Tech Hub Downtown",
  },
  {
    id: "3",
    eventId: "ev-3",
    eventName: "Networking Mixer",
    eventDate: "2024-09-10",
    scannedAt: "2024-09-10T18:45:00Z",
    location: "Grand Hotel",
  },
]

export const mockUsers: Record<string, User> = {
  "member-1": {
    id: "member-1",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    role: "member",
    organization: "tech-events",
    avatar: "👤",
  },
  "scanner-1": {
    id: "scanner-1",
    name: "Sam Chen",
    email: "sam.chen@tech-events.com",
    role: "scanner",
    organization: "tech-events",
  },
  "admin-1": {
    id: "admin-1",
    name: "Jordan Smith",
    email: "jordan@tech-events.com",
    role: "admin",
    organization: "tech-events",
  },
}

export const mockEvents: Event[] = [
  {
    id: "ev-1",
    name: "Annual Conference 2024",
    date: "2024-11-15",
    location: "Convention Center",
    organizationId: "tech-events",
    description: "Annual gathering of tech professionals",
  },
  {
    id: "ev-2",
    name: "Summer Workshop",
    date: "2024-08-22",
    location: "Tech Hub Downtown",
    organizationId: "tech-events",
    description: "Hands-on workshop for developers",
  },
  {
    id: "ev-3",
    name: "Networking Mixer",
    date: "2024-09-10",
    location: "Grand Hotel",
    organizationId: "acme-corp",
    description: "Meet and greet for industry leaders",
  },
]

export const mockPassport: Passport = {
  id: "passport-1",
  memberId: "member-1",
  stamps,
  createdAt: "2024-01-01T00:00:00Z",
}
