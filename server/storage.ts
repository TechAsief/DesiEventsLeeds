import {
  users,
  events,
  analytics,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type InsertAnalytics,
  type Analytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getAllEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  getEventsByUser(userId: string): Promise<Event[]>;
  createEvent(event: InsertEvent & { userId: string }): Promise<Event>;
  updateEvent(id: string, userId: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string, userId: string): Promise<boolean>;
  incrementEventViews(id: string): Promise<void>;
  searchEvents(query: string): Promise<Event[]>;
  filterEventsByDate(filter: string): Promise<Event[]>;
  
  // Analytics operations
  logAnalytics(analytics: InsertAnalytics): Promise<void>;
  getTotalEventPosters(): Promise<number>;
  getTotalEvents(): Promise<number>;
  getUniqueLoginsLast7Days(): Promise<number>;
  getEventCTR(): Promise<number>;
  getRecentActivity(): Promise<any[]>;
  
  // Admin operations
  validateAdminCredentials(email: string, password: string): Promise<boolean>;
  getPendingEvents(): Promise<Event[]>;
  approveEvent(id: string): Promise<Event | undefined>;
  rejectEvent(id: string): Promise<Event | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations
  async getAllEvents(): Promise<Event[]> {
    const result = await db
      .select()
      .from(events)
      .where(and(eq(events.isActive, true), eq(events.approvalStatus, 'approved')))
      .orderBy(desc(events.date), desc(events.time));
    return result;
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.createdAt));
    return result;
  }

  async createEvent(eventData: InsertEvent & { userId: string }): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return event;
  }

  async updateEvent(id: string, userId: string, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({ ...eventData, updatedAt: new Date() })
      .where(and(eq(events.id, id), eq(events.userId, userId)))
      .returning();
    return event;
  }

  async deleteEvent(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async incrementEventViews(id: string): Promise<void> {
    await db
      .update(events)
      .set({ viewsCount: sql`${events.viewsCount} + 1` })
      .where(eq(events.id, id));
  }

  async searchEvents(query: string): Promise<Event[]> {
    const result = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.isActive, true),
          eq(events.approvalStatus, 'approved'),
          sql`${events.title} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(events.date), desc(events.time));
    return result;
  }

  async filterEventsByDate(filter: string): Promise<Event[]> {
    const today = new Date();
    let dateFilter;
    
    switch (filter) {
      case 'today':
        dateFilter = eq(events.date, today.toISOString().split('T')[0]);
        break;
      case 'this_week':
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        dateFilter = and(
          gte(events.date, today.toISOString().split('T')[0]),
          sql`${events.date} <= ${weekFromNow.toISOString().split('T')[0]}`
        );
        break;
      case 'next_month':
        const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        dateFilter = and(
          gte(events.date, today.toISOString().split('T')[0]),
          sql`${events.date} <= ${monthFromNow.toISOString().split('T')[0]}`
        );
        break;
      default:
        dateFilter = gte(events.date, today.toISOString().split('T')[0]);
    }

    const result = await db
      .select()
      .from(events)
      .where(and(eq(events.isActive, true), eq(events.approvalStatus, 'approved'), dateFilter))
      .orderBy(desc(events.date), desc(events.time));
    return result;
  }

  // Analytics operations
  async logAnalytics(analyticsData: InsertAnalytics): Promise<void> {
    await db.insert(analytics).values(analyticsData);
  }

  async getTotalEventPosters(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'poster'));
    return result.count;
  }

  async getTotalEvents(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(events);
    return result.count;
  }

  async getUniqueLoginsLast7Days(): Promise<number> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [result] = await db
      .select({ count: sql`COUNT(DISTINCT ${analytics.userId})` })
      .from(analytics)
      .where(
        and(
          eq(analytics.eventType, 'login'),
          gte(analytics.timestamp, sevenDaysAgo)
        )
      );
    return Number(result.count) || 0;
  }

  async getEventCTR(): Promise<number> {
    // Calculate CTR as (total event views / total home page visits) * 100
    const [viewsResult] = await db
      .select({ count: count() })
      .from(analytics)
      .where(eq(analytics.eventType, 'event_view'));
    
    const [homeVisitsResult] = await db
      .select({ count: count() })
      .from(analytics)
      .where(eq(analytics.eventType, 'home_visit'));
    
    const views = viewsResult.count;
    const homeVisits = homeVisitsResult.count || 1; // Prevent division by zero
    
    return (views / homeVisits) * 100;
  }

  async getRecentActivity(): Promise<any[]> {
    const result = await db
      .select({
        id: analytics.id,
        timestamp: analytics.timestamp,
        eventType: analytics.eventType,
        userId: analytics.userId,
        eventId: analytics.eventId,
        userEmail: users.email,
        eventTitle: events.title,
      })
      .from(analytics)
      .leftJoin(users, eq(analytics.userId, users.id))
      .leftJoin(events, eq(analytics.eventId, events.id))
      .orderBy(desc(analytics.timestamp))
      .limit(20);
    
    return result;
  }

  // Admin operations
  async validateAdminCredentials(email: string, password: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@desieventsleeds.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    return email === adminEmail && password === adminPassword;
  }

  async getPendingEvents(): Promise<Event[]> {
    const result = await db
      .select()
      .from(events)
      .where(eq(events.approvalStatus, 'pending'))
      .orderBy(desc(events.createdAt));
    return result;
  }

  async approveEvent(id: string): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({ approvalStatus: 'approved', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async rejectEvent(id: string): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set({ approvalStatus: 'rejected', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }
}

export const storage = new DatabaseStorage();
