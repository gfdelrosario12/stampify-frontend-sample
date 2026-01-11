import type { User, Org, Event, Passport, Stamp } from "./types";

// ================= ORGS =================
export const organizations: Record<number, Org> = {
  1: { id: 1, name: "ACME Corporation", logo: "🏢", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  2: { id: 2, name: "Tech Events Co", logo: "💻", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  3: { id: 3, name: "Fitness Club Pro", logo: "💪", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
};

// ================= USERS =================
export const mockUsers: Record<number, User> = {
  1: {
    id: 1,
    firstName: "Alex",
    lastName: "Johnson",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    role: "member",
    organization: organizations[2],
    avatar: "👤",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  2: {
    id: 2,
    firstName: "Sam",
    lastName: "Chen",
    name: "Sam Chen",
    email: "sam.chen@tech-events.com",
    role: "scanner",
    organization: organizations[2],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  3: {
    id: 3,
    firstName: "Jordan",
    lastName: "Smith",
    name: "Jordan Smith",
    email: "jordan@tech-events.com",
    role: "admin",
    organization: organizations[2],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
};

// ================= EVENTS =================
export const mockEvents: Event[] = [
  {
    id: 1,
    organization: organizations[2],
    eventName: "Annual Conference 2024",
    eventDescription: "Annual gathering of tech professionals",
    venueName: "Convention Center",
    scheduledAt: "2024-11-15T09:00:00Z",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 2,
    organization: organizations[2],
    eventName: "Summer Workshop",
    eventDescription: "Hands-on workshop for developers",
    venueName: "Tech Hub Downtown",
    scheduledAt: "2024-08-22T14:00:00Z",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: 3,
    organization: organizations[1],
    eventName: "Networking Mixer",
    eventDescription: "Meet and greet for industry leaders",
    venueName: "Grand Hotel",
    scheduledAt: "2024-09-10T18:00:00Z",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

// ================= PASSPORTS =================
export const mockPassports: Passport[] = [
  {
    id: 1,
    member: mockUsers[1],
    issuedAt: "2024-01-01T00:00:00Z",
    stamps: [],
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

// ================= STAMPS =================
export const mockStamps: Stamp[] = [
  {
    id: 1,
    passport: mockPassports[0],
    event: mockEvents[0],
    scanner: mockUsers[2],
    stampedAt: "2024-11-15T09:30:00Z",
    valid: true,
    createdAt: "2024-11-15T09:30:00Z",
    updatedAt: "2024-11-15T09:30:00Z",
  },
  {
    id: 2,
    passport: mockPassports[0],
    event: mockEvents[1],
    scanner: mockUsers[2],
    stampedAt: "2024-08-22T14:15:00Z",
    valid: true,
    createdAt: "2024-08-22T14:15:00Z",
    updatedAt: "2024-08-22T14:15:00Z",
  },
];

mockPassports[0].stamps = mockStamps; // link stamps to passport
