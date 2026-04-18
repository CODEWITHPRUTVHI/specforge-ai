// In-memory store for demo/MVP (replace with real DB in production)
// Using a module-level Map to persist across requests in dev

import { User, Interaction } from "@/types";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Simple in-memory stores
const users = new Map<string, User & { passwordHash: string }>();
const interactions = new Map<string, Interaction[]>(); // userId → interactions[]

export const db = {
  // ─── Auth ─────────────────────────────────────────────────────────────────

  async createUser(email: string, name: string, password: string): Promise<User> {
    if ([...users.values()].find((u) => u.email === email)) {
      throw new Error("Email already in use");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User & { passwordHash: string } = {
      id: uuidv4(),
      email,
      name,
      created_at: new Date().toISOString(),
      profile_completed: false,
      passwordHash,
    };
    users.set(user.id, user);
    return sanitize(user);
  },

  async getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    return [...users.values()].find((u) => u.email === email) || null;
  },

  async getUserById(id: string): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;
    return sanitize(user);
  },

  // ─── Profile ──────────────────────────────────────────────────────────────

  async updateProfile(
    userId: string,
    profile: Partial<User>
  ): Promise<User | null> {
    const user = users.get(userId);
    if (!user) return null;
    const updated = { ...user, ...profile, profile_completed: true };
    users.set(userId, updated);
    return sanitize(updated);
  },

  // ─── Interactions ─────────────────────────────────────────────────────────

  async saveInteraction(interaction: Interaction): Promise<void> {
    const existing = interactions.get(interaction.user_id) || [];
    existing.unshift(interaction); // newest first
    // Keep last 50
    interactions.set(interaction.user_id, existing.slice(0, 50));
  },

  async getInteractions(userId: string): Promise<Interaction[]> {
    return interactions.get(userId) || [];
  },

  async updateFeedback(
    userId: string,
    interactionId: string,
    feedback: "solved" | "partial" | "not-helpful"
  ): Promise<void> {
    const list = interactions.get(userId) || [];
    const idx = list.findIndex((i) => i.id === interactionId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], user_feedback: feedback };
      interactions.set(userId, list);
    }
  },

  // ─── Last problem tracking ────────────────────────────────────────────────

  async updateLastProblem(
    userId: string,
    problem: string,
    response: unknown
  ): Promise<void> {
    const user = users.get(userId);
    if (user) {
      users.set(userId, {
        ...user,
        last_problem: problem,
        last_response: response as User["last_response"],
        last_accessed: new Date().toISOString(),
      });
    }
  },
};

function sanitize(user: User & { passwordHash: string }): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...safe } = user;
  return safe;
}
