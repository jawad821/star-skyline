-- Fix: Create missing call_sessions table for Bareerah AI Agent
-- Derived from error logs in Railway/Postgres

CREATE TABLE IF NOT EXISTS public.call_sessions (
    call_sid character varying(255) PRIMARY KEY,
    flow_step character varying(50),
    locked_slots jsonb DEFAULT '{}'::jsonb,
    caller_phone character varying(20),
    notes text DEFAULT ''::text,
    language character varying(10) DEFAULT 'en'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add index for phone number searches if needed
CREATE INDEX IF NOT EXISTS idx_call_sessions_phone ON public.call_sessions(caller_phone);

-- Add a comment explaining the table's purpose
COMMENT ON TABLE public.call_sessions IS 'Stores active phone call session state for the Bareerah AI Voice Agent.';
