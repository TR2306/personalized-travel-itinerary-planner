-- ========================================================
-- Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Personalized AI Travel Itinerary Planner (RoamAI)
-- ========================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    travel_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    destination TEXT NOT NULL,
    start_location TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL DEFAULT 1,
    budget NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    budget_tier VARCHAR(50) DEFAULT 'Moderate',
    travel_style VARCHAR(50) DEFAULT 'Couple',
    travelers_count INTEGER NOT NULL DEFAULT 2,
    travel_pace VARCHAR(50) DEFAULT 'Balanced',
    interests JSONB DEFAULT '[]'::jsonb,
    accommodation_pref TEXT,
    transportation_pref TEXT,
    dietary_preferences TEXT,
    accessibility_needs TEXT,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ITINERARIES TABLE
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    itinerary_data JSONB NOT NULL,
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_trip_id ON public.itineraries(trip_id);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_trips_updated_at ON public.trips;
CREATE TRIGGER trigger_trips_updated_at
    BEFORE UPDATE ON public.trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_itineraries_updated_at ON public.itineraries;
CREATE TRIGGER trigger_itineraries_updated_at
    BEFORE UPDATE ON public.itineraries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Trips policies
CREATE POLICY "Users can view their own trips"
    ON public.trips FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips"
    ON public.trips FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
    ON public.trips FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
    ON public.trips FOR DELETE
    USING (auth.uid() = user_id);

-- Itineraries policies
CREATE POLICY "Users can view itineraries for their trips"
    ON public.itineraries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = itineraries.trip_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create itineraries for their trips"
    ON public.itineraries FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = itineraries.trip_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update itineraries for their trips"
    ON public.itineraries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = itineraries.trip_id
            AND trips.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete itineraries for their trips"
    ON public.itineraries FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.trips
            WHERE trips.id = itineraries.trip_id
            AND trips.user_id = auth.uid()
        )
    );
