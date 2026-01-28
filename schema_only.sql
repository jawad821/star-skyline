CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE SEQUENCE IF NOT EXISTS public.customers_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.notification_logs_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.users_id_seq;

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id character varying(100) NOT NULL,
    action character varying(20) NOT NULL,
    changes jsonb,
    updated_by_id character varying(100),
    updated_by_name character varying(100),
    user_role character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    ip_address character varying(50)
);

CREATE TABLE public.booking_stops (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid NOT NULL,
    stop_number integer NOT NULL,
    location character varying(255) NOT NULL,
    stop_type character varying(50) NOT NULL,
    duration_minutes integer DEFAULT 0,
    distance_from_previous numeric(10,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_name text,
    customer_phone text,
    pickup_location text,
    dropoff_location text,
    distance_km numeric,
    fare_aed numeric,
    vehicle_type text,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT now(),
    assigned_vehicle_id uuid,
    vendor_id uuid,
    external_id character varying(255),
    payment_method text DEFAULT 'cash'::text,
    driver_id uuid,
    updated_at timestamp without time zone DEFAULT now(),
    passengers_count integer DEFAULT 1,
    luggage_count integer DEFAULT 0,
    booking_type text DEFAULT 'point_to_point'::text,
    caller_number text,
    confirmed_contact_number text,
    customer_email text,
    booking_source character varying(50) DEFAULT 'manually_created'::character varying,
    updated_by character varying(100),
    vehicle_model character varying(100),
    notes text,
    vehicle_color character varying(50),
    rental_hours integer,
    hourly_rate_aed numeric(10,2),
    pickup_time timestamp without time zone,
    flight_arrival_time timestamp without time zone,
    flight_departure_time timestamp without time zone,
    flight_type character varying(20),
    flight_time timestamp with time zone
);

CREATE TABLE public.car_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vehicle_id uuid NOT NULL,
    image_filename character varying(255),
    image_size integer,
    image_type character varying(50),
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(255),
    whatsapp character varying(20),
    preferred_vehicle character varying(50) DEFAULT 'sedan'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);



CREATE TABLE public.driver_ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    booking_id uuid,
    driver_rating integer,
    trip_rating integer,
    customer_feedback text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT driver_ratings_driver_rating_check CHECK (((driver_rating >= 1) AND (driver_rating <= 5))),
    CONSTRAINT driver_ratings_trip_rating_check CHECK (((trip_rating >= 1) AND (trip_rating <= 5)))
);

CREATE TABLE public.drivers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    vendor_id uuid,
    name text NOT NULL,
    phone text,
    license_number text,
    created_at timestamp without time zone DEFAULT now(),
    status text DEFAULT 'offline'::text,
    updated_at timestamp without time zone DEFAULT now(),
    auto_assign boolean DEFAULT true,
    license_issue_date date,
    license_expiry_date date,
    image_url character varying(255),
    email character varying(100),
    password_hash character varying(255),
    bank_account_number character varying(100),
    bank_name character varying(100),
    account_holder_name character varying(100),
    driver_registration_status character varying(50) DEFAULT 'pending'::character varying,
    national_id character varying(50),
    date_of_birth date,
    updated_by character varying(100)
);

CREATE TABLE public.fare_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vehicle_type text NOT NULL,
    base_fare numeric(10,2) NOT NULL,
    per_km_rate numeric(10,2) NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    updated_by character varying(100),
    included_km integer DEFAULT 20
);

CREATE TABLE public.notification_logs (
    id integer NOT NULL,
    recipient_type character varying(50),
    recipient_phone character varying(20),
    recipient_email character varying(255),
    channel character varying(50),
    template_id character varying(100),
    content text,
    status character varying(50),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);




CREATE TABLE public.payouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid NOT NULL,
    amount_aed numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.rental_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vehicle_type character varying(255) NOT NULL,
    hourly_rate_aed numeric(10,2) NOT NULL,
    min_hours integer DEFAULT 3 NOT NULL,
    max_hours integer DEFAULT 14 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    name character varying(255),
    phone character varying(20),
    status character varying(50) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'operator'::character varying, 'vendor'::character varying, 'driver'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);



CREATE TABLE public.vehicles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    vendor_id uuid,
    driver_id uuid,
    plate_number text,
    model text,
    type text,
    created_at timestamp without time zone DEFAULT now(),
    status text DEFAULT 'available'::text,
    max_passengers integer DEFAULT 4,
    max_luggage integer DEFAULT 3,
    has_big_trunk boolean DEFAULT true,
    hourly_price numeric(10,2) DEFAULT 75,
    per_km_price numeric(10,2) DEFAULT 3.5,
    active boolean DEFAULT true,
    color character varying(50),
    image_url character varying(255),
    updated_by character varying(100)
);

CREATE TABLE public.vendor_payouts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    vendor_id uuid,
    booking_id uuid,
    vendor_amount numeric,
    company_profit numeric,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.vendors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    commission_rate numeric DEFAULT 0.8,
    created_at timestamp without time zone DEFAULT now(),
    status character varying(50) DEFAULT 'pending'::character varying,
    bank_account_number character varying(100),
    bank_name character varying(100),
    account_holder_name character varying(100),
    logo_url character varying(255),
    approval_reason text,
    auto_assign_disabled boolean DEFAULT false,
    rejection_reason text,
    password_hash character varying(255)
);

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);
ALTER TABLE ONLY public.notification_logs ALTER COLUMN id SET DEFAULT nextval('public.notification_logs_id_seq'::regclass);
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;
ALTER SEQUENCE public.notification_logs_id_seq OWNED BY public.notification_logs.id;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;