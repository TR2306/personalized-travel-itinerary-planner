import json
import uuid
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
from app.config import settings

# Attempt Supabase client initialization
supabase_client = None
is_supabase_configured = bool(settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL)

if is_supabase_configured:
    try:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print(" Connected to Supabase Cloud Database successfully.")
    except Exception as e:
        print(f"⚠️ Failed to initialize Supabase client: {e}. Falling back to embedded database.")
        supabase_client = None

# Local SQLite Fallback Database setup
LOCAL_DB_PATH = Path(__file__).resolve().parent.parent / "travel_planner.sqlite"

def init_local_db():
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        travel_preferences TEXT DEFAULT '{}',
        created_at TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        destination TEXT NOT NULL,
        start_location TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        days_count INTEGER NOT NULL DEFAULT 1,
        budget REAL NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        budget_tier TEXT DEFAULT 'Moderate',
        travel_style TEXT DEFAULT 'Couple',
        travelers_count INTEGER NOT NULL DEFAULT 2,
        travel_pace TEXT DEFAULT 'Balanced',
        interests TEXT DEFAULT '[]',
        accommodation_pref TEXT,
        transportation_pref TEXT,
        dietary_preferences TEXT,
        accessibility_needs TEXT,
        special_requests TEXT,
        status TEXT DEFAULT 'planned',
        created_at TEXT,
        updated_at TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS itineraries (
        id TEXT PRIMARY KEY,
        trip_id TEXT NOT NULL,
        itinerary_data TEXT NOT NULL,
        estimated_cost REAL NOT NULL DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
    )
    """)
    conn.commit()
    conn.close()

# Initialize local fallback DB on import
init_local_db()

# Database Operation Helper Functions
class DBManager:
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("users").select("*").eq("email", email).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase get_user_by_email error: {e}")
        
        # Local fallback
        conn = sqlite3.connect(LOCAL_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()
        if row:
            d = dict(row)
            if d.get("travel_preferences"):
                try:
                    d["travel_preferences"] = json.loads(d["travel_preferences"])
                except Exception:
                    d["travel_preferences"] = {}
            return d
        return None

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                res = supabase_client.table("users").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase get_user_by_id error: {e}")
        
        conn = sqlite3.connect(LOCAL_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            d = dict(row)
            if d.get("travel_preferences"):
                try:
                    d["travel_preferences"] = json.loads(d["travel_preferences"])
                except Exception:
                    d["travel_preferences"] = {}
            return d
        return None

    @staticmethod
    def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in user_data:
            user_data["id"] = str(uuid.uuid4())
        if "created_at" not in user_data:
            user_data["created_at"] = datetime.utcnow().isoformat()
        
        if supabase_client:
            try:
                supa_data = {
                    "id": user_data["id"],
                    "name": user_data["name"],
                    "email": user_data["email"],
                    "travel_preferences": user_data.get("travel_preferences", {}),
                    "created_at": user_data["created_at"]
                }
                supabase_client.table("users").insert(supa_data).execute()
            except Exception as e:
                print(f"Supabase create_user error: {e}")

        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO users (id, name, email, password_hash, travel_preferences, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                user_data["id"],
                user_data["name"],
                user_data["email"],
                user_data.get("password_hash", ""),
                json.dumps(user_data.get("travel_preferences", {})),
                user_data["created_at"]
            )
        )
        conn.commit()
        conn.close()
        return user_data

    @staticmethod
    def update_user(user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                supabase_client.table("users").update(updates).eq("id", user_id).execute()
            except Exception as e:
                print(f"Supabase update_user error: {e}")

        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        if "name" in updates:
            cursor.execute("UPDATE users SET name = ? WHERE id = ?", (updates["name"], user_id))
        if "travel_preferences" in updates:
            cursor.execute("UPDATE users SET travel_preferences = ? WHERE id = ?", (json.dumps(updates["travel_preferences"]), user_id))
        conn.commit()
        conn.close()
        return DBManager.get_user_by_id(user_id)

    # Trips CRUD
    @staticmethod
    def get_trips(user_id: str) -> List[Dict[str, Any]]:
        trips_list = []
        if supabase_client:
            try:
                res = supabase_client.table("trips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"Supabase get_trips error: {e}")

        conn = sqlite3.connect(LOCAL_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
        rows = cursor.fetchall()
        for row in rows:
            t = dict(row)
            if t.get("interests"):
                try:
                    t["interests"] = json.loads(t["interests"])
                except Exception:
                    t["interests"] = []
            
            # check if there's an itinerary
            cursor.execute("SELECT id, itinerary_data, estimated_cost FROM itineraries WHERE trip_id = ?", (t["id"],))
            it_row = cursor.fetchone()
            if it_row:
                t["itinerary_id"] = it_row["id"]
                try:
                    t["itinerary_data"] = json.loads(it_row["itinerary_data"])
                except Exception:
                    t["itinerary_data"] = None
            trips_list.append(t)
        conn.close()
        return trips_list

    @staticmethod
    def get_trip(trip_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if supabase_client:
            try:
                query = supabase_client.table("trips").select("*").eq("id", trip_id)
                if user_id:
                    query = query.eq("user_id", user_id)
                res = query.execute()
                if res.data and len(res.data) > 0:
                    trip = res.data[0]
                    # Fetch itinerary
                    it_res = supabase_client.table("itineraries").select("*").eq("trip_id", trip_id).execute()
                    if it_res.data and len(it_res.data) > 0:
                        trip["itinerary_id"] = it_res.data[0]["id"]
                        trip["itinerary_data"] = it_res.data[0]["itinerary_data"]
                    return trip
            except Exception as e:
                print(f"Supabase get_trip error: {e}")

        conn = sqlite3.connect(LOCAL_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if user_id:
            cursor.execute("SELECT * FROM trips WHERE id = ? AND user_id = ?", (trip_id, user_id))
        else:
            cursor.execute("SELECT * FROM trips WHERE id = ?", (trip_id,))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return None
        
        trip = dict(row)
        if trip.get("interests"):
            try:
                trip["interests"] = json.loads(trip["interests"])
            except Exception:
                trip["interests"] = []

        cursor.execute("SELECT id, itinerary_data, estimated_cost FROM itineraries WHERE trip_id = ?", (trip_id,))
        it_row = cursor.fetchone()
        if it_row:
            trip["itinerary_id"] = it_row["id"]
            try:
                trip["itinerary_data"] = json.loads(it_row["itinerary_data"])
            except Exception:
                trip["itinerary_data"] = None
        conn.close()
        return trip

    @staticmethod
    def create_trip(trip_data: Dict[str, Any]) -> Dict[str, Any]:
        if "id" not in trip_data:
            trip_data["id"] = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        trip_data["created_at"] = now
        trip_data["updated_at"] = now

        if supabase_client:
            try:
                supa_data = {k: v for k, v in trip_data.items() if k not in ("itinerary_id", "itinerary_data")}
                supabase_client.table("trips").insert(supa_data).execute()
            except Exception as e:
                print(f"Supabase create_trip error: {e}")

        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO trips (
                id, user_id, destination, start_location, start_date, end_date,
                days_count, budget, currency, budget_tier, travel_style,
                travelers_count, travel_pace, interests, accommodation_pref,
                transportation_pref, dietary_preferences, accessibility_needs,
                special_requests, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                trip_data["id"],
                trip_data["user_id"],
                trip_data["destination"],
                trip_data.get("start_location"),
                trip_data["start_date"],
                trip_data["end_date"],
                trip_data.get("days_count", 1),
                trip_data["budget"],
                trip_data.get("currency", "USD"),
                trip_data.get("budget_tier", "Moderate"),
                trip_data.get("travel_style", "Couple"),
                trip_data.get("travelers_count", 2),
                trip_data.get("travel_pace", "Balanced"),
                json.dumps(trip_data.get("interests", [])),
                trip_data.get("accommodation_pref"),
                trip_data.get("transportation_pref"),
                trip_data.get("dietary_preferences"),
                trip_data.get("accessibility_needs"),
                trip_data.get("special_requests"),
                trip_data.get("status", "planned"),
                trip_data["created_at"],
                trip_data["updated_at"]
            )
        )
        conn.commit()
        conn.close()
        return trip_data

    @staticmethod
    def update_trip(trip_id: str, updates: Dict[str, Any], user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        updates["updated_at"] = datetime.utcnow().isoformat()
        
        if supabase_client:
            try:
                clean_updates = {k: v for k, v in updates.items() if k not in ("id", "user_id", "itinerary_id", "itinerary_data")}
                query = supabase_client.table("trips").update(clean_updates).eq("id", trip_id)
                if user_id:
                    query = query.eq("user_id", user_id)
                query.execute()
            except Exception as e:
                print(f"Supabase update_trip error: {e}")

        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        fields = []
        vals = []
        for k, v in updates.items():
            if k in ("id", "user_id", "itinerary_id", "itinerary_data"):
                continue
            fields.append(f"{k} = ?")
            if k == "interests" and isinstance(v, list):
                vals.append(json.dumps(v))
            else:
                vals.append(v)
        
        vals.append(trip_id)
        where_clause = "WHERE id = ?"
        if user_id:
            where_clause += " AND user_id = ?"
            vals.append(user_id)

        sql = f"UPDATE trips SET {', '.join(fields)} {where_clause}"
        cursor.execute(sql, tuple(vals))
        conn.commit()
        conn.close()
        return DBManager.get_trip(trip_id, user_id)

    @staticmethod
    def delete_trip(trip_id: str, user_id: Optional[str] = None) -> bool:
        if supabase_client:
            try:
                query = supabase_client.table("trips").delete().eq("id", trip_id)
                if user_id:
                    query = query.eq("user_id", user_id)
                query.execute()
            except Exception as e:
                print(f"Supabase delete_trip error: {e}")

        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        if user_id:
            cursor.execute("DELETE FROM trips WHERE id = ? AND user_id = ?", (trip_id, user_id))
        else:
            cursor.execute("DELETE FROM trips WHERE id = ?", (trip_id,))
        cursor.execute("DELETE FROM itineraries WHERE trip_id = ?", (trip_id,))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    # Itineraries CRUD
    @staticmethod
    def save_itinerary(trip_id: str, itinerary_data: Dict[str, Any], estimated_cost: float) -> Dict[str, Any]:
        itinerary_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        if supabase_client:
            try:
                # Check if exists
                existing = supabase_client.table("itineraries").select("id").eq("trip_id", trip_id).execute()
                if existing.data and len(existing.data) > 0:
                    itinerary_id = existing.data[0]["id"]
                    supabase_client.table("itineraries").update({
                        "itinerary_data": itinerary_data,
                        "estimated_cost": estimated_cost,
                        "updated_at": now
                    }).eq("id", itinerary_id).execute()
                else:
                    supabase_client.table("itineraries").insert({
                        "id": itinerary_id,
                        "trip_id": trip_id,
                        "itinerary_data": itinerary_data,
                        "estimated_cost": estimated_cost,
                        "created_at": now,
                        "updated_at": now
                    }).execute()
            except Exception as e:
                print(f"Supabase save_itinerary error: {e}")

        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM itineraries WHERE trip_id = ?", (trip_id,))
        row = cursor.fetchone()
        if row:
            itinerary_id = row[0]
            cursor.execute(
                """
                UPDATE itineraries SET itinerary_data = ?, estimated_cost = ?, updated_at = ?
                WHERE id = ?
                """,
                (json.dumps(itinerary_data), estimated_cost, now, itinerary_id)
            )
        else:
            cursor.execute(
                """
                INSERT INTO itineraries (id, trip_id, itinerary_data, estimated_cost, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (itinerary_id, trip_id, json.dumps(itinerary_data), estimated_cost, now, now)
            )
        conn.commit()
        conn.close()

        return {
            "id": itinerary_id,
            "trip_id": trip_id,
            "itinerary_data": itinerary_data,
            "estimated_cost": estimated_cost,
            "updated_at": now
        }
