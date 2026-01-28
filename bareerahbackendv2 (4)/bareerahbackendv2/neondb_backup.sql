--
-- PostgreSQL database dump
--

-- Dumped from database version 16.11 (f45eb12)
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- Name: booking_stops; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.booking_stops OWNER TO neondb_owner;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.bookings OWNER TO neondb_owner;

--
-- Name: car_images; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.car_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vehicle_id uuid NOT NULL,
    image_filename character varying(255),
    image_size integer,
    image_type character varying(50),
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.car_images OWNER TO neondb_owner;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: driver_ratings; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.driver_ratings OWNER TO neondb_owner;

--
-- Name: drivers; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.drivers OWNER TO neondb_owner;

--
-- Name: fare_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.fare_rules OWNER TO neondb_owner;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.notification_logs OWNER TO neondb_owner;

--
-- Name: notification_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notification_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_logs_id_seq OWNER TO neondb_owner;

--
-- Name: notification_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notification_logs_id_seq OWNED BY public.notification_logs.id;


--
-- Name: payouts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid NOT NULL,
    amount_aed numeric(10,2) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payouts OWNER TO neondb_owner;

--
-- Name: rental_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.rental_rules OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.vehicles OWNER TO neondb_owner;

--
-- Name: vendor_payouts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_payouts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    vendor_id uuid,
    booking_id uuid,
    vendor_amount numeric,
    company_profit numeric,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendor_payouts OWNER TO neondb_owner;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: neondb_owner
--

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


ALTER TABLE public.vendors OWNER TO neondb_owner;

--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: notification_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_logs ALTER COLUMN id SET DEFAULT nextval('public.notification_logs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, entity_type, entity_id, action, changes, updated_by_id, updated_by_name, user_role, created_at, ip_address) FROM stdin;
f57818da-62bb-4cd0-aba6-087f3bcb8a0c	driver	bbbb251b-e07d-4434-8c29-9461292d9c51	UPDATE	{"status": {"new": "offline", "old": "online"}}	admin	admin	admin	2025-11-30 01:15:11.075522	\N
e4a9e492-19f1-46d2-82bf-6a16fba8ab98	driver	417ea360-3044-476e-a769-5a2130d96d7a	UPDATE	{"email": {"new": "", "old": "jawaddigitalminds@gmail.com"}}	admin@example.com	admin@example.com	admin	2026-01-07 14:01:01.329882	\N
f43ce05b-fdf6-417e-aea2-169ea016be82	driver	417ea360-3044-476e-a769-5a2130d96d7a	UPDATE	{"phone": {"new": "354854874", "old": "+92354854874"}}	admin@example.com	admin@example.com	admin	2026-01-07 15:15:33.233713	\N
301f839a-5a52-4e1b-8e78-8441db65a2a4	driver	417ea360-3044-476e-a769-5a2130d96d7a	UPDATE	{"email": {"new": "", "old": "jawaddigitalminds@gmail.com"}, "status": {"new": "online", "old": "offline"}}	admin@example.com	admin@example.com	admin	2026-01-07 15:15:48.595081	\N
d7316504-96ed-43ff-b4d7-a94fcd907cba	driver	417ea360-3044-476e-a769-5a2130d96d7a	UPDATE	{"email": {"new": "", "old": "jawaddigitalminds@gmail.com"}, "status": {"new": "offline", "old": "online"}}	admin@example.com	admin@example.com	admin	2026-01-07 15:16:00.251172	\N
dbfb2d49-27ee-4585-adb8-32f9753cf796	driver	417ea360-3044-476e-a769-5a2130d96d7a	UPDATE	{"email": {"new": "", "old": "jawaddigitalminds@gmail.com"}, "status": {"new": "online", "old": "offline"}}	admin@example.com	admin@example.com	admin	2026-01-08 08:54:03.515606	\N
6ae48235-213f-4d09-8641-881f2f432ca9	driver	e9785cd4-837f-4cfa-a535-8a6b3022eea1	UPDATE	{"email": {"new": "", "old": null}}	admin@example.com	admin@example.com	admin	2026-01-08 09:01:04.038099	\N
a1e2e0a4-f1a7-4665-8c9a-0393f0b8d645	driver	417ea360-3044-476e-a769-5a2130d96d7a	UPDATE	{"email": {"new": "", "old": "jawaddigitalminds@gmail.com"}, "status": {"new": "offline", "old": "online"}}	admin@example.com	admin@example.com	admin	2026-01-08 10:12:11.811709	\N
c5533a5d-5c3d-455c-a9a1-daf6f831f51d	driver	26bcd573-1af6-4698-8990-8e95a063635a	UPDATE	{"email": {"new": "", "old": null}, "status": {"new": "Approved", "old": "offline"}}	admin@example.com	admin@example.com	admin	2026-01-08 10:23:45.898079	\N
eba6873b-f1b5-429f-be1f-3e6d35eeec68	driver	417ea360-3044-476e-a769-5a2130d96d7a	UPDATE	{"email": {"new": "", "old": "jawaddigitalminds@gmail.com"}, "status": {"new": "Approved", "old": "offline"}}	admin@example.com	admin@example.com	admin	2026-01-08 12:07:12.805924	\N
38c9090e-c275-41d3-92fe-888056aebfa8	driver	e9785cd4-837f-4cfa-a535-8a6b3022eea1	UPDATE	{"email": {"new": "", "old": null}, "status": {"new": "Approved", "old": "online"}}	admin@example.com	admin@example.com	admin	2026-01-08 12:24:57.679881	\N
c1408066-7fe9-416d-8cff-2b39983d8c44	driver	e9785cd4-837f-4cfa-a535-8a6b3022eea1	UPDATE	{"email": {"new": "", "old": null}, "status": {"new": "online", "old": "Approved"}}	admin@example.com	admin@example.com	admin	2026-01-08 12:25:04.252253	\N
\.


--
-- Data for Name: booking_stops; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.booking_stops (id, booking_id, stop_number, location, stop_type, duration_minutes, distance_from_previous, created_at, updated_at) FROM stdin;
510efc28-2c0a-4e48-80d6-0a81b49e0643	d64d2b39-a0ce-42ba-9047-776611a2c9b0	1	Jumeirah Beach Hotel	pickup	0	0.00	2025-11-30 18:03:03.675426	2025-11-30 18:03:03.675426
88a047c2-7224-4bc5-a402-cc51e8be2182	d64d2b39-a0ce-42ba-9047-776611a2c9b0	2	Downtown Dubai	intermediate	240	0.00	2025-11-30 18:03:03.927953	2025-11-30 18:03:03.927953
87d2fb78-d6db-4df1-96bc-2469f1a2631d	d64d2b39-a0ce-42ba-9047-776611a2c9b0	3	Jumeirah Beach Hotel	dropoff	0	0.00	2025-11-30 18:03:04.175814	2025-11-30 18:03:04.175814
17d8b07f-84b3-439a-987c-21bd2d83e8a6	2697a53a-d39c-443a-91de-a6cb42c4ba22	1	Dubai International Airport	pickup	0	0.00	2025-11-30 18:35:43.948667	2025-11-30 18:35:43.948667
e5e6102d-d1f8-4512-bf73-055adec88511	2697a53a-d39c-443a-91de-a6cb42c4ba22	2	Burj Khalifa	intermediate	180	0.00	2025-11-30 18:35:44.219967	2025-11-30 18:35:44.219967
9f7b3a03-3951-4553-949f-4a99792c58ac	2697a53a-d39c-443a-91de-a6cb42c4ba22	3	Dubai International Airport	dropoff	0	0.00	2025-11-30 18:35:44.468203	2025-11-30 18:35:44.468203
c6f1dc2e-8778-4d5e-b32f-4001c7bacba6	646f5260-bc6c-44a8-8bdc-3e0f3bbd036a	1	Dubai International Airport	pickup	0	0.00	2025-11-30 18:36:31.342995	2025-11-30 18:36:31.342995
5c0bc958-31e5-4201-b406-c6ad6c365828	646f5260-bc6c-44a8-8bdc-3e0f3bbd036a	2	Burj Khalifa	intermediate	180	0.00	2025-11-30 18:36:31.59145	2025-11-30 18:36:31.59145
2875e8a3-2fa5-4107-acd9-d6a5988d0f3e	646f5260-bc6c-44a8-8bdc-3e0f3bbd036a	3	Dubai International Airport	dropoff	0	0.00	2025-11-30 18:36:31.839538	2025-11-30 18:36:31.839538
466a2328-58df-4af5-a22f-6d3b275946b2	d5d1c965-6fd2-4f62-8325-07d9fb7b3689	1	Mall of Emirates	pickup	0	0.00	2025-11-30 18:43:39.430146	2025-11-30 18:43:39.430146
6c3e6cd3-bddd-4277-8a0f-d6e8db555a98	d5d1c965-6fd2-4f62-8325-07d9fb7b3689	2	Burj Khalifa	intermediate	120	0.00	2025-11-30 18:43:39.680229	2025-11-30 18:43:39.680229
c0d63613-de9a-4db1-9fb5-e1a1ad1ea995	d5d1c965-6fd2-4f62-8325-07d9fb7b3689	3	Mall of Emirates	dropoff	0	0.00	2025-11-30 18:43:39.910607	2025-11-30 18:43:39.910607
563e6ec7-256c-4c0f-ad77-9cdda197f569	2d37275f-b0ff-4dd2-8f6d-c656ef11ae21	1	Dubai Airport Terminal 3	pickup	0	0.00	2025-11-30 18:45:57.889757	2025-11-30 18:45:57.889757
a39058d8-9f9f-4f05-a428-728f1d02c35b	2d37275f-b0ff-4dd2-8f6d-c656ef11ae21	2	Dubai Mall	intermediate	240	0.00	2025-11-30 18:45:58.139515	2025-11-30 18:45:58.139515
6fbaaa40-ecda-4253-9d8f-d0b359c0b4f1	2d37275f-b0ff-4dd2-8f6d-c656ef11ae21	3	Dubai Airport Terminal 3	dropoff	0	0.00	2025-11-30 18:45:58.381867	2025-11-30 18:45:58.381867
bf286c64-0b6c-4a0b-be00-359fd8143b55	47e2c37c-593f-49d9-b9f5-0b46369dbfaf	1	Dubai International Airport	pickup	0	0.00	2025-11-30 18:49:28.536912	2025-11-30 18:49:28.536912
d92093c4-03b0-4ba4-94e0-149f55d3ed00	47e2c37c-593f-49d9-b9f5-0b46369dbfaf	2	Burj Khalifa	intermediate	180	0.00	2025-11-30 18:49:28.801078	2025-11-30 18:49:28.801078
02aa8e5d-8456-42f1-8be1-e70b25a18362	47e2c37c-593f-49d9-b9f5-0b46369dbfaf	3	Dubai International Airport	dropoff	0	0.00	2025-11-30 18:49:29.045168	2025-11-30 18:49:29.045168
92ddb0a2-0bb0-461f-bfd4-45396c02d60a	0e8605dd-a53d-476b-8678-09c8f583cd16	1	Abu Dhabi International Airport	pickup	0	0.00	2025-11-30 18:50:12.078977	2025-11-30 18:50:12.078977
bc6cc475-a9ac-42ab-ae3b-06ea7dfb3dae	0e8605dd-a53d-476b-8678-09c8f583cd16	2	Sheikh Zayed Grand Mosque	intermediate	300	0.00	2025-11-30 18:50:12.327864	2025-11-30 18:50:12.327864
2657ad2c-9727-47db-80fc-1ec1d0c74c33	0e8605dd-a53d-476b-8678-09c8f583cd16	3	Abu Dhabi International Airport	dropoff	0	0.00	2025-11-30 18:50:12.575791	2025-11-30 18:50:12.575791
c6dbaee0-aaa1-49d9-b72f-eef3b332f9e1	79d7326c-824a-4a98-b421-e66a715191e6	1	Dubai International Airport	pickup	0	0.00	2025-11-30 18:54:21.919063	2025-11-30 18:54:21.919063
03f84a33-a5b8-4163-bc80-17395473f351	79d7326c-824a-4a98-b421-e66a715191e6	2	Burj Khalifa Downtown	intermediate	180	0.00	2025-11-30 18:54:22.161688	2025-11-30 18:54:22.161688
85d19560-4457-47e3-b33c-a12a910e256a	79d7326c-824a-4a98-b421-e66a715191e6	3	Dubai International Airport	dropoff	0	0.00	2025-11-30 18:54:22.402384	2025-11-30 18:54:22.402384
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bookings (id, customer_name, customer_phone, pickup_location, dropoff_location, distance_km, fare_aed, vehicle_type, status, created_at, assigned_vehicle_id, vendor_id, external_id, payment_method, driver_id, updated_at, passengers_count, luggage_count, booking_type, caller_number, confirmed_contact_number, customer_email, booking_source, updated_by, vehicle_model, notes, vehicle_color, rental_hours, hourly_rate_aed, pickup_time, flight_arrival_time, flight_departure_time, flight_type, flight_time) FROM stdin;
7a15adbe-7065-4e64-8ff3-7e4e03b85c39	Ahmed Mohammed	+971501111111	Downtown Dubai	Dubai Marina	8.5	65.50	classic	completed	2025-12-01 10:30:00	\N	\N	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-12-01 19:49:50.485864	2	0	point_to_point	\N	\N	\N	manually_created	\N	Toyota Camry	\N	White	\N	\N	\N	\N	\N	\N	\N
27b21a2d-cdb5-4713-a862-2fb79ebb6e0b	Fatima Al Maktoum	+971502222222	Dubai Marina	Burj Khalifa	6.2	52.00	classic	completed	2025-12-01 14:45:00	\N	\N	\N	cash	26bcd573-1af6-4698-8990-8e95a063635a	2025-12-01 19:49:50.485864	1	1	point_to_point	\N	\N	\N	manually_created	\N	Toyota Camry	\N	White	\N	\N	\N	\N	\N	\N	\N
5781657f-6e45-47eb-a791-ddfe6dfb0979	Mohammed Hassan	+971503333333	JBR	Dubai Mall	4.8	48.75	urban_suv	completed	2025-12-02 08:00:00	\N	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-01 19:49:50.485864	3	0	point_to_point	\N	\N	\N	manually_created	\N	Toyota Highlander	\N	Black	\N	\N	\N	\N	\N	\N	\N
e137208f-ca47-4c60-9e22-f998985eb85d	Layla Ahmed	+971504444444	Palm Jumeirah	Deira	15.3	95.25	executive	completed	2025-12-02 16:20:00	\N	\N	\N	card	bb37d0b3-5956-4644-85f1-d9fc441cc7a4	2025-12-01 19:49:50.485864	2	0	point_to_point	\N	\N	\N	manually_created	\N	Lexus ES 300H	\N	Silver	\N	\N	\N	\N	\N	\N	\N
f45280e2-9960-4ea1-9ba1-aa1173153c8b	Hassan Khalid	+971505555555	Dubai Silicon Oasis	Downtown	12.1	78.50	classic	completed	2025-12-03 09:15:00	\N	\N	\N	cash	e9785cd4-837f-4cfa-a535-8a6b3022eea1	2025-12-01 19:49:50.485864	1	2	point_to_point	\N	\N	\N	manually_created	\N	BMW 5 Series	\N	Black	\N	\N	\N	\N	\N	\N	\N
d8262339-69e2-4989-b4bb-f7e39a9ab120	Noor Ibrahim	+971506666666	DIFC	Dubai Museum	7.9	61.25	first_class	completed	2025-12-03 13:30:00	\N	\N	\N	card	dd639c64-7587-4d69-a4ca-86dfafb00e5c	2025-12-01 19:49:50.485864	2	0	point_to_point	\N	\N	\N	manually_created	\N	Mercedes S Class	\N	White	\N	\N	\N	\N	\N	\N	\N
b888acf7-fead-48be-aac4-f73a5e2d7c4e	Hamza Sheikh	+971561000003	Business Bay	Dubai Mall	8	57	luxury	pending	2025-11-24 18:17:51.687798	1d0ac375-e4c6-4fce-8db6-60bbda20931a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-26 18:17:51.687798	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2f5b41b0-4b53-41a6-b032-44136bec39ce	Karim Fareed	+971507777777	Dubai Airport	Downtown Dubai	24.5	155.00	luxury	completed	2025-12-04 06:45:00	\N	\N	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-12-01 19:49:50.485864	3	2	point_to_point	\N	\N	\N	manually_created	\N	Range Rover	\N	Black	\N	\N	\N	\N	\N	\N	\N
b1baccaa-f5ca-467d-8915-c3e1bf53a104	Sara AlMansoori	+971508888888	Sharjah	Dubai Marina	28.7	178.50	luxury_suv	completed	2025-12-04 12:00:00	\N	\N	\N	cash	26bcd573-1af6-4698-8990-8e95a063635a	2025-12-01 19:49:50.485864	4	1	point_to_point	\N	\N	\N	manually_created	\N	Cadillac Escalade	\N	Gray	\N	\N	\N	\N	\N	\N	\N
5fcab47a-18cf-4e3c-903c-b1840178bb21	Omar Rashid	+971509999999	Business Bay	Dubai Festival City	9.3	70.75	urban_suv	completed	2025-12-05 15:20:00	\N	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-01 19:49:50.485864	2	0	point_to_point	\N	\N	\N	manually_created	\N	BYD Song	\N	Silver	\N	\N	\N	\N	\N	\N	\N
f5c3bcc2-d40a-4348-99d8-6c604a893ef5	Ali Habib	+971502020202	Emirates Mall	Dubai Creek	5.5	50.00	classic	completed	2025-12-06 10:10:00	\N	\N	\N	cash	e9785cd4-837f-4cfa-a535-8a6b3022eea1	2025-12-01 19:49:50.485864	1	0	point_to_point	\N	\N	\N	manually_created	\N	Toyota Camry	\N	Black	\N	\N	\N	\N	\N	\N	\N
d7327b11-e288-4fb6-8a71-a549fc5f149b	Zara Ali	+971561000006	Sharjah Corniche	Deira	22	148	luxury	pending	2025-11-21 18:17:52.377267	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-26 18:17:52.377267	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
dc58be4f-8487-456c-bf23-1103353c51af	Hassan Rauf	+971561000009	Mall of Emirates	JBR	14	96	luxury	completed	2025-11-18 18:17:53.073598	da82e6c3-bacc-404a-b7e5-7095e832adfa	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	dd639c64-7587-4d69-a4ca-86dfafb00e5c	2025-11-26 18:17:53.073598	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
75c0cc45-0664-4ecc-b1f3-ba7acda45d91	Hira Salman	+971561000012	Sharjah Industrial	DXB Airport	38	252	luxury	completed	2025-11-15 18:17:53.779039	d0e18893-9cee-45ff-9d55-37951100b64b	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	bb37d0b3-5956-4644-85f1-d9fc441cc7a4	2025-11-26 18:17:53.779039	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ac3ce546-84bf-4565-a111-d93d394e72d1	Hamza Sheikh	+971561000003	JBR	DXB Airport	27	180.5	luxury	completed	2025-11-12 18:17:54.468887	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	e9785cd4-837f-4cfa-a535-8a6b3022eea1	2025-11-26 18:17:54.468887	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
067bfa20-ab99-47bb-b2ec-1404cca2e522	Aisha	+9715249837121	Mall of Emirates	Convention Centre	18	122	luxury	completed	2025-11-25 10:12:52.974736	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	32b6548e-dd3a-4e12-b045-759671263394	2025-11-25 10:12:52.974736	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7ceb0c26-24ea-4713-a6ae-d03834dcf9f7	Layla	+9715624550734	Downtown Dubai	Atlantis The Palm	37	245.5	luxury	completed	2025-11-21 09:43:53.440632	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-21 09:43:53.440632	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
af653f1a-9a98-4cec-840e-ce4d17bc5dfb	Ali	+9715581532082	Mall of Emirates	Jumeirah Beach	21	141.5	luxury	completed	2025-11-25 16:30:53.667795	d0e18893-9cee-45ff-9d55-37951100b64b	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-25 16:30:53.667795	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d24fea87-5605-485b-9554-8dc66e5fbc9e	Ahmed	+9715803366130	Burj Khalifa	Deira City Center	39	258.5	luxury	pending	2025-11-22 17:27:53.895443	7ad96261-ddbc-4a64-b177-7575d522071c	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-22 17:27:53.895443	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5915cd1e-0bdd-45bd-aebc-907a7fc320f1	Aisha	+9715006499258	Downtown Dubai	JBR	16	109	luxury	cancelled	2025-11-23 05:25:54.350672	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-23 05:25:54.350672	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
460d70b2-3e7c-4774-a63c-cef65da3880f	Fatima	+9715564176649	Mall of Emirates	Emirates Towers	40	265	luxury	completed	2025-11-20 13:12:54.57832	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-20 13:12:54.57832	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d50678e2-9ec5-4d4c-9784-fbb2d58c1b46	Ali Raza	+971561000001	Dubai Mall	DXB Airport	18	68	classic	completed	2025-11-26 18:17:51.223256	da82e6c3-bacc-404a-b7e5-7095e832adfa	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-26 18:17:51.223256	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
12319a51-49b6-48b5-8977-272d90264cff	Ayesha Malik	+971561000004	JBR	Mall of Emirates	15	57.5	classic	cancelled	2025-11-23 18:17:51.917386	d0e18893-9cee-45ff-9d55-37951100b64b	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-26 18:17:51.917386	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
dbfb93d3-fa61-4bb7-9cdf-2154bcf1e9ed	Bilal Ahmed	+971561000007	Ajman City	Dubai Marina	40	145	classic	completed	2025-11-20 18:17:52.606332	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-26 18:17:52.606332	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
21841462-f0d5-4f98-be62-fc813a9b7cf2	Rabia Iqbal	+971561000010	Dubai Frame	Dubai Mall	9	36.5	classic	pending	2025-11-17 18:17:53.313618	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-26 18:17:53.313618	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
18ef2c09-9e35-4b1c-a0be-2a11cddad4b2	Ali Raza	+971561000001	Dubai Silicon Oasis	Business Bay	21	78.5	classic	pending	2025-11-14 18:17:54.008326	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	ba981095-24ed-4cdb-9f6a-b450e5fe9e99	2025-11-26 18:17:54.008326	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
0c83849e-bd5f-42fe-807c-b4d9adc8e0e8	Sara	+9715842484979	Deira	Downtown	16	61	classic	pending	2025-11-26 08:35:53.213109	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	eb1175b3-0ab7-4134-a870-58c0397a139f	2025-11-26 08:35:53.213109	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
202f6f40-7ef5-4872-96f4-f3d5566b88d0	Sara	+9715712588265	Dubai Marina	JBR	47	169.5	classic	completed	2025-11-22 15:46:54.8056	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	7dc4b95a-83e1-4abf-aa5a-88f2e463f1f3	2025-11-22 15:46:54.8056	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7eff05d6-fc15-4f6b-b49a-aae31e58cfea	Fatima Khan	+971561000002	Marina Walk	JBR Beach	6	32	urban_suv	completed	2025-11-25 18:17:51.458689	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-26 18:17:51.458689	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ec35b942-1876-4326-b2f8-1ca8b9a88a28	Usman Tariq	+971561000005	Sharjah City	DXB Airport	35	162.5	urban_suv	completed	2025-11-22 18:17:52.146735	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-26 18:17:52.146735	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2b801f3e-bdab-4ba9-abb5-9344d3478498	Sana Noor	+971561000008	Deira	Business Bay	17	81.5	urban_suv	completed	2025-11-19 18:17:52.835218	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	eb1175b3-0ab7-4134-a870-58c0397a139f	2025-11-26 18:17:52.835218	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d38539ba-b8d0-4b34-9f6f-3269887bafc2	Danish Mehmood	+971561000011	Business Bay	Jumeirah	11	54.5	urban_suv	completed	2025-11-16 18:17:53.542578	1d0ac375-e4c6-4fce-8db6-60bbda20931a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-26 18:17:53.542578	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
32aa7ea7-a2cd-4a56-b13a-ca723035838f	Fatima Khan	+971561000002	Ajman Corniche	Deira	42	194	urban_suv	completed	2025-11-13 18:17:54.239503	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	7dc4b95a-83e1-4abf-aa5a-88f2e463f1f3	2025-11-26 18:17:54.239503	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2d3a483f-3bb8-48f2-9fe7-6fca93b83486	Fatima	+9715420682027	Mall of Emirates	Convention Centre	43	284.5	luxury	completed	2025-11-22 22:26:55.034229	31278e30-8220-4ce1-ab93-b739d0afe503	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-22 22:26:55.034229	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3d8460fc-b187-4774-ba17-c0c1cc26f2d5	Zainab Noor	+971503030303	Deira City Center	Bur Dubai	3.2	42.25	classic	completed	2025-12-06 14:30:00	\N	\N	\N	card	dd639c64-7587-4d69-a4ca-86dfafb00e5c	2025-12-01 19:49:50.485864	1	0	point_to_point	\N	\N	\N	manually_created	\N	BYD Han	\N	Silver	\N	\N	\N	\N	\N	\N	\N
8c3c19d2-71d3-4ce5-94bc-e2126056d0cb	Ahmed	+9715277816450	Burj Khalifa	Convention Centre	17	115.5	luxury	completed	2025-11-24 20:59:55.490804	1d0ac375-e4c6-4fce-8db6-60bbda20931a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-24 20:59:55.490804	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d5f04a27-abfd-4862-b70f-dd9aee674f59	Ibrahim Mohammed	+971504040404	Mall of Emirates	Downtown	8.7	64.75	first_class	completed	2025-12-07 11:45:00	\N	\N	\N	cash	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-12-01 19:49:50.485864	2	0	point_to_point	\N	\N	\N	manually_created	\N	Audi A8	\N	Black	\N	\N	\N	\N	\N	\N	\N
5010d07a-0808-4aca-b29a-509e935bd2d8	Hana Al Farsi	+971505050505	Dubai Outlet Mall	Dubai Sports City	13.5	89.50	luxury_suv	completed	2025-12-07 16:00:00	\N	\N	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-12-01 19:49:50.485864	4	1	point_to_point	\N	\N	\N	manually_created	\N	GMC Yukon	\N	Blue	\N	\N	\N	\N	\N	\N	\N
e0bd39c6-68b6-4050-a03e-07ddaf714b35	Rashid Ali	+971506060606	Ibn Battuta Mall	Palm Jumeirah	22.3	142.75	elite_van	completed	2025-12-08 09:30:00	\N	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-01 19:49:50.485864	6	2	point_to_point	\N	\N	\N	manually_created	\N	Mercedes V Class	\N	Black	\N	\N	\N	\N	\N	\N	\N
48488d22-85fb-406a-9f7f-be3cb1269468	jawad	0354854874	Dubai International Airport	cafe de palma	22.6	450	luxury	in-process	2025-12-12 13:57:26.226018	ab209cb6-cba3-4f61-b265-380ca4085cb8	\N	\N	cash	\N	2025-12-12 13:57:26.226018	1	0	airport_transfer	\N	\N	test@gmail.com	manually_created	\N	Range Rover	\N	Silver	\N	\N	2025-12-20 20:57:00	\N	\N	\N	\N
33156ece-a65e-47a8-9d1e-be6212f40f58	Ali	+9715102981306	Dubai Marina	Atlantis The Palm	49	323.5	luxury	completed	2025-11-25 20:55:56.628418	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-25 20:55:56.628418	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c4b14dfd-2e8d-407a-9751-cceb5c2750ec	Ahmed	+9715951487405	Deira	Atlantis The Palm	20	135	luxury	completed	2025-11-21 22:18:57.539171	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-21 22:18:57.539171	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3ae21332-687d-40a4-a6f3-bd957742fa90	jwd!	+16186880438	Dubai International Airport Terminal 3	Dubai Marina	32.92	58.14	suv	in-process	2025-12-12 17:53:15.711503	7da8aa3f-8701-48d7-81e9-6abba62dd860	\N	\N	cash	32b6548e-dd3a-4e12-b045-759671263394	2025-12-12 17:53:15.711503	3	5	airport_transfer	\N	\N	\N	manually_created	\N	Toyota Highlander	n n n n n n	Black	\N	\N	2025-12-12 16:30:00	\N	\N	arrival	2025-12-13 11:00:00+00
3bfb8d4f-a3d2-4c3e-82fc-efa7b9e3ad37	Aisha	+9715344028027	Dubai Airport	Dubai Mall	41	271.5	luxury	completed	2025-11-21 02:21:58.002487	da82e6c3-bacc-404a-b7e5-7095e832adfa	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	eb1175b3-0ab7-4134-a870-58c0397a139f	2025-11-21 02:21:58.002487	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f862d633-6931-4ab4-b8de-739a4458354b	Sara	+9715143876643	Sharjah	Dubai Mall	20	135	luxury	completed	2025-11-23 09:06:58.229883	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-23 09:06:58.229883	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ba3c1a92-1b9c-43c0-a042-baf88232da65	Hassan	+9715262158138	Jumeirah Beach	Dubai Mall	14	96	luxury	completed	2025-11-22 20:12:58.456685	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	dd639c64-7587-4d69-a4ca-86dfafb00e5c	2025-11-22 20:12:58.456685	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6d88fc9c-8cb2-456f-a5c0-b0986c67dea6	Omar	+9715246241128	Sharjah	Jumeirah Beach	41	271.5	luxury	completed	2025-11-21 12:26:58.911506	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-21 12:26:58.911506	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8143437c-9ba2-4cd5-af10-c76b745f660d	Ahmed	+9715790783147	Deira	JBR	9	63.5	luxury	pending	2025-11-21 22:45:59.139496	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	32b6548e-dd3a-4e12-b045-759671263394	2025-11-21 22:45:59.139496	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b6740ae0-14af-4b5d-ae6d-fcb5b4e37fb5	Sara	+9715908105413	Dubai Airport	Marina	28	187	luxury	completed	2025-11-21 01:26:59.366425	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-21 01:26:59.366425	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5111697e-0632-48d0-9507-8ad69d399380	Sara	+9715473388591	Deira	Marina	31	206.5	luxury	pending	2025-11-21 06:53:59.593624	1d0ac375-e4c6-4fce-8db6-60bbda20931a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-21 06:53:59.593624	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b56d42cc-51e1-4d57-9e98-907e2a4eaf63	Ahmed	+9715675758179	Burj Khalifa	Emirates Towers	27	180.5	luxury	completed	2025-11-21 18:56:00.048598	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-21 18:56:00.048598	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
89083d0d-72fd-480a-b855-aa06f3cdfc5c	Aisha	+9715840242105	Burj Khalifa	Emirates Towers	9	63.5	luxury	completed	2025-11-24 13:23:00.730498	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-24 13:23:00.730498	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f8aa9377-45a5-4346-a299-6b8b4891819d	Aisha	+9715849407389	Burj Khalifa	Deira City Center	17	115.5	luxury	completed	2025-11-20 08:13:01.185319	bf2f71f5-7e19-4f57-b251-251c87ee6c66	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-20 08:13:01.185319	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ed232dd0-db36-4672-a90c-45dc5053e12a	Fatima	+9715313607408	Abu Dhabi	Airport Hotel	11	76.5	luxury	completed	2025-11-24 01:35:03.233936	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	eb1175b3-0ab7-4134-a870-58c0397a139f	2025-11-24 01:35:03.233936	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8d213c02-89ed-4c13-8b41-165d1e7e8815	Layla	+9715817587578	Burj Khalifa	Dubai Mall	44	291	luxury	cancelled	2025-11-20 05:37:03.460935	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	bb37d0b3-5956-4644-85f1-d9fc441cc7a4	2025-11-20 05:37:03.460935	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4a0e24df-ef86-4026-92cc-8c16b3c0c1c3	Aisha	+9715997095300	Business Bay	Convention Centre	30	140	urban_suv	completed	2025-11-21 10:58:56.401698	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-21 10:58:56.401698	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2bb44fe8-f333-4e83-8dc2-f7326a7770ca	Layla	+9715902961730	Abu Dhabi	Downtown	12	59	urban_suv	completed	2025-11-26 09:36:57.083699	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-26 09:36:57.083699	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
1df12e39-5a0d-4f44-a579-8077165d32bf	Ahmed	+9715211992112	Dubai Marina	Deira City Center	22	104	urban_suv	pending	2025-11-24 03:25:57.311746	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	7dc4b95a-83e1-4abf-aa5a-88f2e463f1f3	2025-11-24 03:25:57.311746	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
bdae2393-e7bc-4cc2-a9bd-2b9b2b8dc27a	Sara	+9715035111976	Burj Khalifa	Deira City Center	30	140	urban_suv	completed	2025-11-21 13:21:57.768476	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-21 13:21:57.768476	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c380b091-3ec2-486d-a99f-81e1a92faaab	Layla	+9715933697635	Burj Khalifa	Marina	41	189.5	urban_suv	completed	2025-11-20 01:07:00.275676	1d0ac375-e4c6-4fce-8db6-60bbda20931a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	eb1175b3-0ab7-4134-a870-58c0397a139f	2025-11-20 01:07:00.275676	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
25834ada-f7cf-444f-84f1-7d650d0ced50	Ali	+9715930081538	Deira	JBR	29	135.5	urban_suv	completed	2025-11-20 00:25:00.957756	d0e18893-9cee-45ff-9d55-37951100b64b	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-20 00:25:00.957756	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
70cd07e5-8178-4de4-a382-0cb3d783a3ed	Aisha	+9715183756780	Deira	Marina	42	194	urban_suv	completed	2025-11-20 00:34:01.867874	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	eb1175b3-0ab7-4134-a870-58c0397a139f	2025-11-20 00:34:01.867874	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5fbc7e7f-2eb1-45c8-8880-f3e9fe879dba	Layla	+9715340455711	Dubai Airport	Downtown	7	36.5	urban_suv	cancelled	2025-11-25 18:26:02.55211	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	32b6548e-dd3a-4e12-b045-759671263394	2025-11-25 18:26:02.55211	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b84cd20f-365b-4b17-ad13-47cd08bf0e8c	Ahmed	+9715653587827	Sharjah	Marina	41	189.5	urban_suv	completed	2025-11-20 06:27:03.00678	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	eb1175b3-0ab7-4134-a870-58c0397a139f	2025-11-20 06:27:03.00678	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d74c6dcf-6b1f-47a3-b4ff-6220eb3a6d66	Aisha	+9715654696196	Abu Dhabi	Downtown	10	50	urban_suv	completed	2025-11-19 22:01:03.692374	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-19 22:01:03.692374	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3e089ff9-8a91-4034-aad6-98c2b8c01c8b	Sara	+9715041307472	Jumeirah Beach	Airport Hotel	42	278	luxury	completed	2025-11-21 19:16:03.91944	1d0ac375-e4c6-4fce-8db6-60bbda20931a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	ba981095-24ed-4cdb-9f6a-b450e5fe9e99	2025-11-21 19:16:03.91944	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
503ec7c8-6f7a-41fb-8499-22efd9f0338e	Hassan	+9715475272201	Sharjah	Dubai Mall	24	161	luxury	completed	2025-11-26 02:36:04.146456	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-26 02:36:04.146456	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8313e14a-3caa-4ce7-8562-b491315e34d9	jawad nazari	+92354854874	Dubai Festival City	Palm Jumeirah	20	\N	elite_van	pending	2025-12-09 12:58:37.872703	\N	\N	WP-1765285115807	card	\N	2025-12-09 12:58:37.872703	1	1	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f0b27791-9f61-43f9-9cdb-a8276e3993b8	Sara	+9715240427277	Jumeirah Beach	Marina	30	200	luxury	completed	2025-11-22 22:15:05.055254	da82e6c3-bacc-404a-b7e5-7095e832adfa	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-22 22:15:05.055254	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4c995a82-383c-47c2-bd7e-23fc29436361	Aisha	+9715862985756	Burj Khalifa	Deira City Center	27	180.5	luxury	pending	2025-11-21 14:12:06.41982	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	7dc4b95a-83e1-4abf-aa5a-88f2e463f1f3	2025-11-21 14:12:06.41982	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6f3f57a5-767e-4664-ab8a-bc758def28b9	Sara	+9715157721924	Downtown Dubai	JBR	35	232.5	luxury	pending	2025-11-26 09:25:06.87346	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	dd639c64-7587-4d69-a4ca-86dfafb00e5c	2025-11-26 09:25:06.87346	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c5b783cc-7eb8-4895-bb71-7f61a263d180	Test User	+971501234567	Dubai Mall	Abu Dhabi Airport	15	\N	classic	pending	2025-12-09 15:55:19.76446	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-09 15:55:19.76446	2	2	point_to_point	\N	\N	test@example.com	wordpress	\N	Toyota Hiace	Test booking from WordPress form	Black	\N	\N	\N	\N	\N	\N	\N
32f3a6e3-0c1e-4177-b191-cf5cc2aa308a	Usman	+9710559033884	Dubai Airport Terminal 1	Dubai International Financial Centre	15	174.22	luxury_suv	pending	2025-12-09 16:08:01.131397	c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	\N	\N	cash	\N	2025-12-09 16:08:01.131397	5	4	round_trip	\N	\N	usman@gmail.com	wordpress	\N	Cadillac Escalade	Child Seats: 5 (Seat: 2, Booster: 2, Infant: 1) | Pickup: 2025-12-09 @ 21:06 | Return: 2025-12-26 @ 09:08 | Stop: mall  | Child Seats: 5	Gray	\N	\N	\N	\N	\N	\N	\N
add6e57a-fe69-4af7-b64c-9ee621311b2e	Asad	+971354854874	Mall of Emirates	Dubai International Airport	15	201.44	luxury_suv	pending	2025-12-09 16:40:40.361707	c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	\N	\N	cash	\N	2025-12-09 16:40:40.361707	5	4	round_trip	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	Cadillac Escalade	Child Seats: 6 (Seat: 3, Booster: 2, Infant: 1) | Pickup: 2025-12-09 @ 21:38 | Return: 2025-12-10 @ 00:39 | Stop: Jabel ali | Child Seats: 6	Gray	\N	\N	\N	\N	\N	\N	\N
5481de10-6d38-4383-ba50-cad2d9626488	Customer	+16186880438	The Way, Marina Mall	Dubai Airport	0	0	suv	in-process	2025-12-10 18:24:34.415936	7da8aa3f-8701-48d7-81e9-6abba62dd860	\N	\N	cash	32b6548e-dd3a-4e12-b045-759671263394	2025-12-10 18:24:34.415936	3	4	point_to_point	\N	\N	\N	manually_created	\N	Toyota Highlander	Yeah, I need water in the car.	Black	\N	\N	\N	\N	\N	\N	\N
0f64bf21-6ff1-4d01-820f-f88b5f173551	Ahmed	+9715003571443	Jumeirah Beach	Emirates Towers	12	83	luxury	pending	2025-11-21 13:44:08.693702	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-21 13:44:08.693702	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
934e49e0-4744-42f0-941b-abaf95e9d446	Layla	+9715365069751	Sharjah	Deira City Center	48	317	luxury	cancelled	2025-11-20 14:47:10.059746	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-20 14:47:10.059746	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
805a38b0-fabe-4e68-ba61-7c84ed37d158	Fatima	+9715503786875	Abu Dhabi	Convention Centre	13	89.5	luxury	completed	2025-11-25 22:43:10.970917	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-25 22:43:10.970917	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
42a9a816-bcb3-42e2-9c7f-fde0a93727f4	Fatima	+9715446795434	Dubai Marina	Downtown	32	213	luxury	completed	2025-11-22 07:11:11.198006	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-22 07:11:11.198006	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4b636072-47be-4104-b59c-a0be09ba67f5	Ahmed	+9715063039330	Burj Khalifa	Jumeirah Beach	15	102.5	luxury	completed	2025-11-21 14:01:11.880806	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-21 14:01:11.880806	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
aa04f985-d026-4ada-a10f-d13b4e30f073	Layla	+9715577648412	Downtown Dubai	Convention Centre	21	99.5	urban_suv	completed	2025-11-22 08:09:04.373821	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	eb1175b3-0ab7-4134-a870-58c0397a139f	2025-11-22 08:09:04.373821	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c28939dd-fbfc-4194-910e-f67b860c7119	Ali	+9715770979543	Abu Dhabi	JBR	8	41	urban_suv	completed	2025-11-25 18:53:04.601008	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	ba981095-24ed-4cdb-9f6a-b450e5fe9e99	2025-11-25 18:53:04.601008	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e7e831a6-ebe6-45bd-b112-1e31c79486ca	Layla	+9715475410976	Business Bay	Jumeirah Beach	10	50	urban_suv	cancelled	2025-11-23 14:20:04.827941	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-23 14:20:04.827941	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f3a989ad-f362-4750-b040-7d0752b6fe46	Omar	+9715457420747	Burj Khalifa	Atlantis The Palm	11	54.5	urban_suv	completed	2025-11-26 11:04:05.510995	d0e18893-9cee-45ff-9d55-37951100b64b	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-26 11:04:05.510995	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
be6ab74d-a323-4f84-baa2-26fc75fd6625	Ahmed	+9715480371102	Business Bay	Dubai Mall	43	198.5	urban_suv	completed	2025-11-21 20:12:05.965687	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-21 20:12:05.965687	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ce28e0e6-3a71-45d2-bdcc-312f545123c7	Hassan	+9715784305854	Deira	Marina	12	59	urban_suv	completed	2025-11-25 02:53:07.100341	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	bb37d0b3-5956-4644-85f1-d9fc441cc7a4	2025-11-25 02:53:07.100341	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
920fa0e0-5827-4049-b8fc-cfbef75e293f	Layla	+9715672368721	Burj Khalifa	Dubai Mall	40	185	urban_suv	completed	2025-11-23 22:30:07.327727	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-23 22:30:07.327727	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
22b954cc-255e-4e62-844f-1f4d8581f83b	Ahmed	+9715557989237	Downtown Dubai	Dubai Mall	18	86	urban_suv	completed	2025-11-25 17:35:08.465387	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-25 17:35:08.465387	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a7ad03a7-3f68-4757-8a27-a351327ccb3a	Layla	+9715987012685	Sharjah	Downtown	35	162.5	urban_suv	completed	2025-11-22 11:22:09.147614	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-22 11:22:09.147614	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6e09c9ba-ad34-4f02-bad8-c04907405ef0	Ahmed	+9715403899391	Deira	Jumeirah Beach	16	77	urban_suv	completed	2025-11-25 03:52:09.37463	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	bb37d0b3-5956-4644-85f1-d9fc441cc7a4	2025-11-25 03:52:09.37463	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
3daf3697-b302-4b70-ab06-dc9d042bd714	Omar	+9715749202911	Downtown Dubai	JBR	34	158	urban_suv	cancelled	2025-11-25 22:41:10.287185	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	dd639c64-7587-4d69-a4ca-86dfafb00e5c	2025-11-25 22:41:10.287185	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e03475f8-5b90-4316-b041-c11b11b0aadf	Hassan	+9715039966516	Sharjah	Jumeirah Beach	46	212	urban_suv	completed	2025-11-21 00:48:11.653452	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	7dc4b95a-83e1-4abf-aa5a-88f2e463f1f3	2025-11-21 00:48:11.653452	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ec1e7b1d-62ee-46df-88ea-dd9fbbe5fa8d	Layla	+9715568740491	Downtown Dubai	Convention Centre	34	158	urban_suv	completed	2025-11-25 19:01:12.33622	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	ba981095-24ed-4cdb-9f6a-b450e5fe9e99	2025-11-25 19:01:12.33622	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
db6f124b-90fb-454f-892c-6aff560225f7	Ali	+9715683246161	Mall of Emirates	Downtown	44	291	luxury	pending	2025-11-24 06:49:13.261267	31278e30-8220-4ce1-ab93-b739d0afe503	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-24 06:49:13.261267	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f6fae8ff-f26a-4ec8-b36f-d5cc84e0bc12	Yasmin Said	+971501010101	Dubai Hills Estate	Jumeirah	11.2	82.50	executive	pending	2025-12-05 17:40:00	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-12-01 19:49:50.485864	2	1	point_to_point	\N	\N	\N	manually_created	\N	Lexus ES 300H	\N	Silver	\N	\N	\N	\N	\N	\N	\N
07e948eb-25b3-4439-80e1-bb58e4311735	Test Customer	+971501234567	Dubai Mall	Abu Dhabi Airport	15	185	executive	pending	2025-12-09 16:30:10.28948	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-12-09 16:30:10.28948	2	1	point_to_point	\N	\N	test@example.com	wordpress	\N	Lexus ES 300H	Airport pickup - flight EK123 | Pickup: December 16, 2025 @ 10:00 AM	Silver	\N	\N	\N	\N	\N	\N	\N
3a9f7a7c-8845-4003-9f70-62a288ebcd32	test	+971354854874	Dubai International Airport	DXB	15	119.78	executive	pending	2025-12-15 14:12:47.262284	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-12-15 14:12:47.262284	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	Lexus ES 300H	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-15 @ 19:10 | Child Seats: 3	Silver	\N	\N	\N	\N	\N	\N	\N
10cf0719-6cb0-449e-b0eb-103feb858689	Test Executive	971501234561	Dubai Downtown	Abu Dhabi Downtown	21	126	executive	in-process	2025-11-30 02:22:04.748856	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-30 02:22:04.748856	2	1	point_to_point	\N	\N	test1@test.com	manually_created	\N	Lexus ES 300H	\N	Silver	\N	\N	\N	\N	\N	\N	\N
cb8841f3-3a81-451b-beef-35eba4bfd31d	Layla	+9715877453395	Mall of Emirates	Downtown	43	284.5	luxury	completed	2025-11-22 23:16:14.852199	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	e9785cd4-837f-4cfa-a535-8a6b3022eea1	2025-11-22 23:16:14.852199	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
34d6b1c3-9f35-4937-8db4-f88cfc810ec0	Executive Test	971501234561	Dubai Downtown	Abu Dhabi Downtown	21	126	executive	in-process	2025-11-30 02:22:52.503094	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-30 02:22:52.503094	2	1	point_to_point	\N	\N	test1@test.com	manually_created	\N	Lexus ES 300H	\N	Silver	\N	\N	\N	\N	\N	\N	\N
cf9f9461-58c1-41f0-87ae-96d738cf062e	Ahmed MS Direct	+971501234567	Dubai Airport	Burj Khalifa	23	143	executive	pending	2025-11-30 18:03:02.886915	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-30 18:03:02.886915	2	1	multi_stop	\N	\N	\N	bareerah_ai	\N	Lexus ES 300H	\N	Silver	\N	\N	\N	\N	\N	\N	\N
f7421bc3-28e0-466b-beb4-213138012697	jawad nazari	+971354854874	Business Bay	Dubai Hills Estate	15	201.44	executive	pending	2025-12-15 15:30:27.170804	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-12-15 15:30:27.170804	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	Lexus ES 300H	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2025-12-15 @ 20:28 | Child Seats: 6	Silver	\N	\N	\N	\N	\N	\N	\N
685fffba-5128-4d16-b0ef-144c2375e1ec	Jawad Test	+971501234567	Dubai Mall	Abu Dhabi Airport	15	225.5	classic	pending	2025-12-09 15:59:39.514191	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-09 15:59:39.514191	3	2	point_to_point	\N	\N	jawad@test.com	wordpress	\N	Toyota Hiace	Please arrive 10 mins early | Pickup: December 15, 2025 @ 7:01 PM | Stop: Dubai Marina | Child Seats: 2 | WhatsApp: +971509876543	Black	\N	\N	\N	\N	\N	\N	\N
550a9544-3b63-4744-a780-7e5b967f682b	Aisha	+9715809419572	Dubai Airport	Jumeirah Beach	10	50	urban_suv	cancelled	2025-11-25 03:28:12.806314	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-25 03:28:12.806314	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
8dc9f6d3-e464-4400-80b2-b56cc2336819	Test Classic	971501234560	Dubai Downtown	Abu Dhabi Downtown	15	95	classic	in-process	2025-11-30 02:22:03.873748	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 02:22:03.873748	2	1	point_to_point	\N	\N	test0@test.com	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
6b0a40f3-de57-4b61-9155-573bf4c9014f	Email Test User	+971505555555	Burj Khalifa, Dubai	Yas Island, Abu Dhabi	15	320	luxury_suv	pending	2025-12-09 16:31:04.684005	c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	\N	\N	card	\N	2025-12-09 16:31:04.684005	4	3	point_to_point	\N	\N	emailtest@example.com	wordpress	\N	Cadillac Escalade	VIP guest - airport transfer | Pickup: December 18, 2025 @ 3:00 PM	Gray	\N	\N	\N	\N	\N	\N	\N
4c2b2b38-e5cb-4c97-a680-28c3b7e7077f	Hassan	+9715122896991	Abu Dhabi	Emirates Towers	47	216.5	urban_suv	completed	2025-11-24 19:26:13.715215	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-24 19:26:13.715215	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b66a5b6d-c0fd-4fc9-a1ee-cd21efc6cf80	Test Luxury	971501234564	Dubai Downtown	Abu Dhabi Downtown	35	233	luxury_suv	in-process	2025-11-30 02:22:07.225827	c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	\N	\N	card	\N	2025-11-30 02:22:07.225827	2	1	point_to_point	\N	\N	test4@test.com	manually_created	\N	Cadillac Escalade	\N	Gray	\N	\N	\N	\N	\N	\N	\N
531a22d1-e9c6-45af-b48d-73d3acf676f5	रमीज!	+16186880438	Dubai International Airport	dubai marina mall	33.7	61.65	suv	in-process	2025-12-10 18:48:02.943209	7da8aa3f-8701-48d7-81e9-6abba62dd860	\N	\N	cash	32b6548e-dd3a-4e12-b045-759671263394	2025-12-10 18:48:02.943209	3	4	point_to_point	\N	\N	\N	manually_created	\N	Toyota Highlander	जी मुझे ठंडा पानी चाहिए होगा गाड़ी में!	Black	\N	\N	\N	\N	\N	\N	\N
dca86146-635e-4700-8f58-096a63af899d	Test Urban	971501234562	Dubai Downtown	Abu Dhabi Downtown	25	133	urban_suv	in-process	2025-11-30 02:22:05.557231	7da8aa3f-8701-48d7-81e9-6abba62dd860	\N	\N	card	32b6548e-dd3a-4e12-b045-759671263394	2025-11-30 02:22:05.557231	2	1	point_to_point	\N	\N	test2@test.com	manually_created	\N	Toyota Highlander	\N	Black	\N	\N	\N	\N	\N	\N	\N
7fce74e6-b1fa-441e-9c51-c92774c483a0	Fatima	+9715314127963	Burj Khalifa	Atlantis The Palm	28	131	urban_suv	completed	2025-11-25 10:43:13.943686	d0e18893-9cee-45ff-9d55-37951100b64b	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-25 10:43:13.943686	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
65ddcd09-e5e7-4de6-9862-1edea62050c1	Test Van	971501234563	Dubai Downtown	Abu Dhabi Downtown	30	225	elite_van	in-process	2025-11-30 02:22:06.396466	\N	\N	\N	card	\N	2025-11-30 02:22:06.396466	2	1	point_to_point	\N	\N	test3@test.com	manually_created	\N	Not specified	\N	\N	\N	\N	\N	\N	\N	\N	\N
38a5f7e5-c488-4a4c-a8b4-00822b2fd081	Layla	+9715224699251	Burj Khalifa	Deira City Center	23	85.5	classic	cancelled	2025-11-19 20:56:13.033669	da82e6c3-bacc-404a-b7e5-7095e832adfa	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	7dc4b95a-83e1-4abf-aa5a-88f2e463f1f3	2025-11-19 20:56:13.033669	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d902893d-6770-40b9-8634-3b748ff6fff1	Ali	+9715059089897	Dubai Airport	Convention Centre	34	124	classic	completed	2025-11-24 04:47:13.488323	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-24 04:47:13.488323	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5fc032d1-9be4-44f5-830b-516f9a31c415	Hassan	+9715446245659	Dubai Airport	Downtown	32	117	classic	cancelled	2025-11-24 20:36:14.17075	da82e6c3-bacc-404a-b7e5-7095e832adfa	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-24 20:36:14.17075	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2b909de9-df88-428d-a3ed-53c077bf0a22	Aisha	+9715616682245	Jumeirah Beach	Convention Centre	7	29.5	classic	completed	2025-11-25 08:12:15.306985	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	32b6548e-dd3a-4e12-b045-759671263394	2025-11-25 08:12:15.306985	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e4390b37-09a5-4d64-b0ae-c72f6c4852a3	Omar	+9715974323896	Deira	Marina	13	50.5	classic	completed	2025-11-24 05:46:15.534486	7ad96261-ddbc-4a64-b177-7575d522071c	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-24 05:46:15.534486	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
4ef7137b-7444-4daa-97ac-6d27e1c19ed4	Layla	+9715880683636	Jumeirah Beach	Airport Hotel	9	45.5	urban_suv	completed	2025-11-20 17:50:14.398114	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-20 17:50:14.398114	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b04ded99-e197-4a49-a447-3f082df07a0d	Ali	+9715138846176	Jumeirah Beach	Atlantis The Palm	34	158	urban_suv	pending	2025-11-19 20:15:14.624933	d0e18893-9cee-45ff-9d55-37951100b64b	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-19 20:15:14.624933	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
bdd50598-8645-4c06-9b7a-dad00d05e617	Ahmed	+9715786662129	Dubai Marina	Emirates Towers	49	225.5	urban_suv	cancelled	2025-11-26 13:05:15.079963	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-26 13:05:15.079963	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6935d8a7-de08-4a3c-8c46-e005fe3b6638	Test FirstClass	971501234565	Dubai Downtown	Abu Dhabi Downtown	40	450	first_class	in-process	2025-11-30 02:22:08.072824	\N	\N	\N	card	\N	2025-11-30 02:22:08.072824	2	1	point_to_point	\N	\N	test5@test.com	manually_created	\N	Not specified	\N	\N	\N	\N	\N	\N	\N	\N	\N
de80fa04-3dc8-4a9f-bb9c-b5b74fe9ece4	Test MiniBus	971501234566	Dubai Downtown	Abu Dhabi Downtown	50	825	mini_bus	in-process	2025-11-30 02:22:08.892115	\N	\N	\N	card	\N	2025-11-30 02:22:08.892115	2	1	point_to_point	\N	\N	test6@test.com	manually_created	\N	Not specified	\N	\N	\N	\N	\N	\N	\N	\N	\N
5f929e7f-a365-4745-ab8e-6c31f6916e48	First Class Test	971501234565	Dubai Downtown	Abu Dhabi Downtown	40	450	first_class	in-process	2025-11-30 02:22:53.824981	\N	\N	\N	card	\N	2025-11-30 02:22:53.824981	4	2	point_to_point	\N	\N	test5@test.com	manually_created	\N	Not specified	\N	\N	\N	\N	\N	\N	\N	\N	\N
b541eab7-6af8-45c0-8ed8-4d0596b1010e	Elite Van Test	971501234563	Dubai Downtown	Abu Dhabi Downtown	30	225	elite_van	in-process	2025-11-30 02:22:53.886822	\N	\N	\N	card	\N	2025-11-30 02:22:53.886822	4	2	point_to_point	\N	\N	test3@test.com	manually_created	\N	Not specified	\N	\N	\N	\N	\N	\N	\N	\N	\N
2e5a9d53-e9b9-4607-8257-d0b29a92b6ef	Mini Bus Test	971501234566	Dubai Downtown	Abu Dhabi Downtown	50	825	mini_bus	in-process	2025-11-30 02:22:53.981434	\N	\N	\N	card	\N	2025-11-30 02:22:53.981434	6	3	point_to_point	\N	\N	test6@test.com	manually_created	\N	Not specified	\N	\N	\N	\N	\N	\N	\N	\N	\N
8f1fc1ea-e9e9-4c09-a65a-5bac6e310c53	Classic Test	971501234560	Dubai Downtown	Abu Dhabi Downtown	15	95	classic	in-process	2025-11-30 02:22:53.822902	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 02:22:53.822902	2	1	point_to_point	\N	\N	test0@test.com	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
9612955b-748a-47a0-823e-365489ab2902	Luxury SUV Test	971501234564	Dubai Downtown	Abu Dhabi Downtown	35	233	luxury_suv	in-process	2025-11-30 02:22:53.922095	c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	\N	\N	card	\N	2025-11-30 02:22:53.922095	3	1	point_to_point	\N	\N	test4@test.com	manually_created	\N	Cadillac Escalade	\N	Gray	\N	\N	\N	\N	\N	\N	\N
a470172f-6b27-4663-9a99-e6b734eb3f57	Urban SUV Test	971501234562	Dubai Downtown	Abu Dhabi Downtown	25	133	urban_suv	in-process	2025-11-30 02:22:53.925454	7da8aa3f-8701-48d7-81e9-6abba62dd860	\N	\N	card	32b6548e-dd3a-4e12-b045-759671263394	2025-11-30 02:22:53.925454	3	1	point_to_point	\N	\N	test2@test.com	manually_created	\N	Toyota Highlander	\N	Black	\N	\N	\N	\N	\N	\N	\N
d2a3a33d-298c-4197-add5-8780dbd7da20	Classic 35km	971502000000	Dubai Downtown	Abu Dhabi Downtown	35	110	classic	in-process	2025-11-30 02:29:52.842915	e05e9f46-3245-4658-bebe-b478492db40d	\N	\N	card	\N	2025-11-30 02:29:52.842915	2	1	point_to_point	\N	\N	test0@test.com	manually_created	\N	BYD Han	\N	\N	\N	\N	\N	\N	\N	\N	\N
34e71cac-81e3-4a86-8372-823be786bf5c	Executive 35km	971502000001	Dubai Downtown	Abu Dhabi Downtown	35	120	executive	in-process	2025-11-30 02:29:53.96294	d32e7b7e-7468-4b71-8fbe-627207d31156	\N	\N	card	\N	2025-11-30 02:29:53.96294	2	1	point_to_point	\N	\N	test1@test.com	manually_created	\N	Lexus ES 300H	\N	\N	\N	\N	\N	\N	\N	\N	\N
00068300-6b2c-4ab3-94a7-1163d45ba836	Urban SUV 35km	971502000002	Dubai Downtown	Abu Dhabi Downtown	35	123	urban_suv	in-process	2025-11-30 02:29:55.059707	25e647ca-92a5-4c3b-bb54-9b4be85f7a37	\N	\N	card	\N	2025-11-30 02:29:55.059707	3	1	point_to_point	\N	\N	test2@test.com	manually_created	\N	Toyota Highlander	\N	\N	\N	\N	\N	\N	\N	\N	\N
f301cf48-a6ba-4988-b351-52573d1a45ba	Elite Van 35km	971502000003	Dubai Downtown	Abu Dhabi Downtown	35	195	elite_van	in-process	2025-11-30 02:29:56.159207	6475177d-4fd6-441f-b884-291d1d608d6e	\N	\N	card	\N	2025-11-30 02:29:56.159207	4	2	point_to_point	\N	\N	test3@test.com	manually_created	\N	Mercedes V Class	\N	\N	\N	\N	\N	\N	\N	\N	\N
72b0af4e-a698-496a-8755-455f2ab66d86	Luxury SUV 35km	971502000004	Dubai Downtown	Abu Dhabi Downtown	35	197	luxury_suv	in-process	2025-11-30 02:29:57.251333	26229440-c91c-41c5-85a2-0bd94df6ab4d	\N	\N	card	\N	2025-11-30 02:29:57.251333	3	1	point_to_point	\N	\N	test4@test.com	manually_created	\N	GMC Yukon	\N	\N	\N	\N	\N	\N	\N	\N	\N
22394c3c-27df-4699-a2a4-37b764a86810	First Class 35km	971502000005	Dubai Downtown	Abu Dhabi Downtown	35	450	first_class	in-process	2025-11-30 02:29:58.371651	32e5e3c1-d52e-4f16-8e0f-55a3605f2ca9	\N	\N	card	\N	2025-11-30 02:29:58.371651	4	2	point_to_point	\N	\N	test5@test.com	manually_created	\N	BMW 7 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
1f67e0e5-2e72-421e-8d3f-1a0b7b9aaf89	Mini Bus 35km	971502000006	Dubai Downtown	Abu Dhabi Downtown	35	825	mini_bus	in-process	2025-11-30 02:29:59.459332	3ba9706d-7654-46f2-9b77-9dc8811a8dc2	\N	\N	card	\N	2025-11-30 02:29:59.459332	6	3	point_to_point	\N	\N	test6@test.com	manually_created	\N	Mercedes Sprinter	\N	\N	\N	\N	\N	\N	\N	\N	\N
badb82c5-07ba-42a3-a2c0-a7ca2494cfe3	Classic 35km	971502000000	Dubai Downtown	Abu Dhabi Downtown	35	110	classic	in-process	2025-11-30 02:34:23.301801	e05e9f46-3245-4658-bebe-b478492db40d	\N	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-30 02:34:23.301801	2	1	point_to_point	\N	\N	final0@test.com	manually_created	\N	BYD Han	\N	\N	\N	\N	\N	\N	\N	\N	\N
a623be3c-9541-4897-9910-9384d9327d08	Executive 35km	971502000001	Dubai Downtown	Abu Dhabi Downtown	35	120	executive	in-process	2025-11-30 02:34:24.310836	d32e7b7e-7468-4b71-8fbe-627207d31156	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 02:34:24.310836	2	1	point_to_point	\N	\N	final1@test.com	manually_created	\N	Lexus ES 300H	\N	\N	\N	\N	\N	\N	\N	\N	\N
3dae0ac3-fd70-45b9-9aaa-1d274002fad1	Urban SUV 35km	971502000002	Dubai Downtown	Abu Dhabi Downtown	35	123	urban_suv	in-process	2025-11-30 02:34:25.314154	25e647ca-92a5-4c3b-bb54-9b4be85f7a37	\N	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-30 02:34:25.314154	3	1	point_to_point	\N	\N	final2@test.com	manually_created	\N	Toyota Highlander	\N	\N	\N	\N	\N	\N	\N	\N	\N
239312b9-7b85-4b44-93dd-b51581dda0a9	Elite Van 35km	971502000003	Dubai Downtown	Abu Dhabi Downtown	35	195	elite_van	in-process	2025-11-30 02:34:26.320222	6475177d-4fd6-441f-b884-291d1d608d6e	\N	\N	card	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-30 02:34:26.320222	4	2	point_to_point	\N	\N	final3@test.com	manually_created	\N	Mercedes V Class	\N	\N	\N	\N	\N	\N	\N	\N	\N
568dff91-6411-4320-a577-3d461add6d92	Luxury SUV 35km	971502000004	Dubai Downtown	Abu Dhabi Downtown	35	197	luxury_suv	in-process	2025-11-30 02:34:27.322455	26229440-c91c-41c5-85a2-0bd94df6ab4d	\N	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-30 02:34:27.322455	3	1	point_to_point	\N	\N	final4@test.com	manually_created	\N	GMC Yukon	\N	\N	\N	\N	\N	\N	\N	\N	\N
e62243ce-72c1-4300-a5cb-598853ca19e3	First Class 35km	971502000005	Dubai Downtown	Abu Dhabi Downtown	35	450	first_class	in-process	2025-11-30 02:34:28.330132	32e5e3c1-d52e-4f16-8e0f-55a3605f2ca9	\N	\N	card	32b6548e-dd3a-4e12-b045-759671263394	2025-11-30 02:34:28.330132	4	2	point_to_point	\N	\N	final5@test.com	manually_created	\N	BMW 7 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
f8d71008-f201-4407-b680-acb4979e0552	Mini Bus 35km	971502000006	Dubai Downtown	Abu Dhabi Downtown	35	825	mini_bus	in-process	2025-11-30 02:34:29.340079	3ba9706d-7654-46f2-9b77-9dc8811a8dc2	\N	\N	card	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-30 02:34:29.340079	6	3	point_to_point	\N	\N	final6@test.com	manually_created	\N	Mercedes Sprinter	\N	\N	\N	\N	\N	\N	\N	\N	\N
f906d0e1-8b3c-4a88-94b0-15e2770d340c	Test Customer 0	971505555000	Dubai Downtown	Abu Dhabi Downtown	25	825	mini_bus	in-process	2025-11-30 03:14:30.205115	3ba9706d-7654-46f2-9b77-9dc8811a8dc2	\N	\N	card	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-30 03:14:30.205115	2	1	point_to_point	\N	\N	customer0@test.ae	manually_created	\N	Mercedes Sprinter	\N	\N	\N	\N	\N	\N	\N	\N	\N
fd0b6c5c-4249-4818-b4ae-b68607c0476c	Test Customer 1	971505555001	Marina Dubai	Mall of the Emirates	35	110	classic	in-process	2025-11-30 03:14:31.307964	e05e9f46-3245-4658-bebe-b478492db40d	\N	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-30 03:14:31.307964	2	1	point_to_point	\N	\N	customer1@test.ae	manually_created	\N	BYD Han	\N	\N	\N	\N	\N	\N	\N	\N	\N
a1e41e08-afdd-4f14-80e0-f92b67cf4bdf	Test Customer 2	971505555002	Burj Khalifa	Deira	42	127	executive	in-process	2025-11-30 03:14:32.342192	d32e7b7e-7468-4b71-8fbe-627207d31156	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 03:14:32.342192	2	1	point_to_point	\N	\N	customer2@test.ae	manually_created	\N	Lexus ES 300H	\N	\N	\N	\N	\N	\N	\N	\N	\N
b24713d7-08f1-479b-8332-79e90c981a94	Test Customer 3	971505555003	Dubai Mall	Jumeirah Beach	18	450	first_class	in-process	2025-11-30 03:14:33.338456	32e5e3c1-d52e-4f16-8e0f-55a3605f2ca9	\N	\N	card	32b6548e-dd3a-4e12-b045-759671263394	2025-11-30 03:14:33.338456	2	1	point_to_point	\N	\N	customer3@test.ae	manually_created	\N	BMW 7 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
d55dc0bd-2d6c-4bf4-b20a-502edae45273	Test Customer 4	971505555004	Palm Jumeirah	Dubai Airport	50	224	luxury_suv	in-process	2025-11-30 03:14:34.390926	26229440-c91c-41c5-85a2-0bd94df6ab4d	\N	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-30 03:14:34.390926	2	1	point_to_point	\N	\N	customer4@test.ae	manually_created	\N	GMC Yukon	\N	\N	\N	\N	\N	\N	\N	\N	\N
51af5368-598f-4232-936d-18b8d6d102a9	Test Customer 5	971505555005	Dubai Downtown	Abu Dhabi Downtown	30	118	urban_suv	in-process	2025-11-30 03:14:35.421222	25e647ca-92a5-4c3b-bb54-9b4be85f7a37	\N	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-30 03:14:35.421222	2	1	point_to_point	\N	\N	customer5@test.ae	manually_created	\N	Toyota Highlander	\N	\N	\N	\N	\N	\N	\N	\N	\N
8e92e1b0-1355-42d0-8fb2-19e7a3bb3eb8	Test Customer 6	971505555006	Marina Dubai	Mall of the Emirates	28	181	elite_van	in-process	2025-11-30 03:14:36.551774	6475177d-4fd6-441f-b884-291d1d608d6e	\N	\N	card	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-30 03:14:36.551774	2	1	point_to_point	\N	\N	customer6@test.ae	manually_created	\N	Mercedes V Class	\N	\N	\N	\N	\N	\N	\N	\N	\N
37b3a365-7f1a-41bc-bf7e-d70d649d0967	Test Customer 7	971505555007	Burj Khalifa	Deira	45	458.75	luxury	in-process	2025-11-30 03:14:37.577073	31278e30-8220-4ce1-ab93-b739d0afe503	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 03:14:37.577073	2	1	point_to_point	\N	\N	customer7@test.ae	manually_created	\N	BMW 5 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
fb2e781c-7325-4237-809d-00b3bc40ed4f	Test Customer 8	971505555008	Dubai Mall	Jumeirah Beach	22	450	luxury	in-process	2025-11-30 03:14:38.578461	31278e30-8220-4ce1-ab93-b739d0afe503	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 03:14:38.578461	2	1	point_to_point	\N	\N	customer8@test.ae	manually_created	\N	BMW 5 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
97f69c30-1d26-40cd-8113-611c74ddde23	Test Customer 9	971505555009	Palm Jumeirah	Dubai Airport	40	206	luxury_suv	in-process	2025-11-30 03:14:39.59567	26229440-c91c-41c5-85a2-0bd94df6ab4d	\N	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-30 03:14:39.59567	2	1	point_to_point	\N	\N	customer9@test.ae	manually_created	\N	GMC Yukon	\N	\N	\N	\N	\N	\N	\N	\N	\N
35a68ac1-28c5-45b2-9ee6-c61c17bc6d0c	Test Customer 10	971505555010	Dubai Downtown	Abu Dhabi Downtown	33	825	mini_bus	in-process	2025-11-30 03:14:40.590648	c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	\N	\N	card	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-30 03:14:40.590648	2	1	point_to_point	\N	\N	customer10@test.ae	manually_created	\N	Mercedes Sprinter	\N	\N	\N	\N	\N	\N	\N	\N	\N
d78f1e54-246d-4bcc-acbb-b5cdb6054b56	Test Customer 11	971505555011	Marina Dubai	Mall of the Emirates	38	113	classic	in-process	2025-11-30 03:14:41.592725	45563e13-c868-430d-beb3-e5b6d8121543	\N	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-30 03:14:41.592725	2	1	point_to_point	\N	\N	customer11@test.ae	manually_created	\N	BYD Han	\N	\N	\N	\N	\N	\N	\N	\N	\N
e2c805aa-7765-41b1-897a-a6379132d513	Test Customer 12	971505555012	Burj Khalifa	Deira	27	112	executive	in-process	2025-11-30 03:14:42.631922	ab209cb6-cba3-4f61-b265-380ca4085cb8	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 03:14:42.631922	2	1	point_to_point	\N	\N	customer12@test.ae	manually_created	\N	Lexus ES 300H	\N	\N	\N	\N	\N	\N	\N	\N	\N
7cc2cddd-10df-45f1-b354-847b2e597a66	Test Customer 13	971505555013	Dubai Mall	Jumeirah Beach	31	450	first_class	in-process	2025-11-30 03:14:43.658022	185801b2-aef3-4efa-ab6f-3cc9e5aa3ed2	\N	\N	card	32b6548e-dd3a-4e12-b045-759671263394	2025-11-30 03:14:43.658022	2	1	point_to_point	\N	\N	customer13@test.ae	manually_created	\N	BMW 7 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
49890642-236b-41dc-892a-e99d757f3c1d	Test Customer 14	971505555014	Palm Jumeirah	Dubai Airport	29	186.2	luxury_suv	in-process	2025-11-30 03:14:44.773818	7da8aa3f-8701-48d7-81e9-6abba62dd860	\N	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-30 03:14:44.773818	2	1	point_to_point	\N	\N	customer14@test.ae	manually_created	\N	GMC Yukon	\N	\N	\N	\N	\N	\N	\N	\N	\N
871f0339-76de-44cd-9a17-543bd0a37b1b	Test Customer 15	971505555015	Dubai Downtown	Abu Dhabi Downtown	43	131	urban_suv	in-process	2025-11-30 03:14:45.859709	3e742f31-9e12-4852-a126-7ef790fc7033	\N	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-30 03:14:45.859709	2	1	point_to_point	\N	\N	customer15@test.ae	manually_created	\N	Toyota Highlander	\N	\N	\N	\N	\N	\N	\N	\N	\N
b364e6ea-e40f-48df-97a3-6dc2dc0190f2	Test Customer 16	971505555016	Marina Dubai	Mall of the Emirates	26	177	elite_van	in-process	2025-11-30 03:14:46.875606	e5293bbf-8ca0-4ff5-8119-08a8ac35ba8f	\N	\N	card	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-30 03:14:46.875606	2	1	point_to_point	\N	\N	customer16@test.ae	manually_created	\N	Mercedes V Class	\N	\N	\N	\N	\N	\N	\N	\N	\N
d82db0b9-0a88-4993-8019-64a7a720b59f	Test Customer 17	971505555017	Burj Khalifa	Deira	36	450	luxury	in-process	2025-11-30 03:14:47.88748	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 03:14:47.88748	2	1	point_to_point	\N	\N	customer17@test.ae	manually_created	\N	BMW 5 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
3a7c2414-65e6-4518-a1c2-ad6ca3d09a9e	Test Customer 18	971505555018	Dubai Mall	Jumeirah Beach	32	450	luxury	in-process	2025-11-30 03:14:48.905011	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	card	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 03:14:48.905011	2	1	point_to_point	\N	\N	customer18@test.ae	manually_created	\N	BMW 5 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
01407cb2-be55-46e2-84e6-5d074b0807de	Test Customer 19	971505555019	Palm Jumeirah	Dubai Airport	37	200.6	luxury_suv	in-process	2025-11-30 03:14:49.95085	a67cd6bf-cdf8-48a0-ad08-8a7d6ad0a20f	\N	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-30 03:14:49.95085	2	1	point_to_point	\N	\N	customer19@test.ae	manually_created	\N	GMC Yukon	\N	\N	\N	\N	\N	\N	\N	\N	\N
d229f59b-7341-44d7-abcb-c7f81df14271	Demo Customer	971501234567	Dubai Airport	Burj Khalifa	15	\N	mini_bus	pending	2025-11-30 04:52:04.869563	\N	\N	\N	cash	\N	2025-11-30 04:52:04.869563	2	1	point_to_point	\N	\N	demo@test.ae	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
f28d756d-54fa-417f-9008-6529abddd5c7	Sara Al-Mansouri	971551234567	Dubai Mall	Emirates Towers	8	\N	mini_bus	pending	2025-11-30 04:53:27.952462	\N	\N	\N	cash	\N	2025-11-30 04:53:27.952462	2	2	point_to_point	\N	\N	sara@example.ae	manually_created	\N	\N	✅ DEMO TEST: Customer prefers AC on max. Has 2 suitcases. Call 5 min before arrival.	\N	\N	\N	\N	\N	\N	\N	\N
58b44da5-f8ee-4f3a-b4c4-9fea017df618	Test Notes	971501234567	Dubai Airport	Burj Khalifa	20	\N	mini_bus	pending	2025-11-30 04:53:41.54643	\N	\N	\N	cash	\N	2025-11-30 04:53:41.54643	2	1	point_to_point	\N	\N	\N	manually_created	\N	\N	Test notes working - customer has fragile items	\N	\N	\N	\N	\N	\N	\N	\N
6cc165e4-7716-42e2-9dcf-5ae47b7197f9	Bug Test Fix	971501234567	Dubai Airport	Burj Khalifa	25	825	mini_bus	in-process	2025-11-30 04:59:45.727337	a67cd6bf-cdf8-48a0-ad08-8a7d6ad0a20f	\N	\N	cash	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-30 04:59:45.727337	2	1	point_to_point	\N	\N	test@test.ae	manually_created	\N	Mercedes Sprinter	Testing all 4 bug fixes - should have fare, vehicle, driver, and notes	\N	\N	\N	\N	\N	\N	\N	\N
2e4fb6a4-bfbd-4a5b-8542-534b45d93e3e	Perfect Test Booking	971501234567	Dubai Airport Terminal 1	Downtown Dubai Mall	35	825	mini_bus	in-process	2025-11-30 05:02:24.572616	a67cd6bf-cdf8-48a0-ad08-8a7d6ad0a20f	\N	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-30 05:02:24.572616	4	2	point_to_point	\N	\N	perfect@test.ae	manually_created	\N	Mercedes Sprinter	VIP customer - needs premium service. Fragile electronics onboard. Call 5 min before arrival.	White	\N	\N	\N	\N	\N	\N	\N
e2600dab-189d-4175-aec2-b757d2071ecb	FINAL PERFECT TEST	971501111111	Dubai Airport	Burj Khalifa	30	825	mini_bus	in-process	2025-11-30 05:04:26.766662	a67cd6bf-cdf8-48a0-ad08-8a7d6ad0a20f	\N	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-30 05:04:26.766662	3	2	point_to_point	\N	\N	\N	manually_created	\N	Mercedes Sprinter	This is the perfect test - should show fare, vehicle, driver, color, and notes!	White	\N	\N	\N	\N	\N	\N	\N
a3fad101-1e18-4cc3-b41b-4db687b6de15	NOTES TEST FINAL	971501234567	Dubai Airport	Burj Khalifa	30	825	mini_bus	in-process	2025-11-30 16:56:48.752924	a67cd6bf-cdf8-48a0-ad08-8a7d6ad0a20f	\N	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-30 16:56:48.752924	3	2	point_to_point	\N	\N	\N	manually_created	\N	Mercedes Sprinter	THESE ARE THE NOTES - Should display in modal!	White	\N	\N	\N	\N	\N	\N	\N
d64d2b39-a0ce-42ba-9047-776611a2c9b0	Razia RT Direct	+971502345678	Jumeirah Beach Hotel	Jumeirah Beach Hotel	50	440	luxury	pending	2025-11-30 18:03:03.42715	\N	\N	\N	cash	\N	2025-11-30 18:03:03.42715	3	2	round_trip	\N	\N	\N	bareerah_ai	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
2697a53a-d39c-443a-91de-a6cb42c4ba22	Ahmed Al Mansouri	+971501234567	Dubai International Airport	Dubai International Airport	60	450	luxury	pending	2025-11-30 18:35:43.659698	\N	\N	\N	cash	\N	2025-11-30 18:35:43.659698	2	1	round_trip	\N	\N	\N	manually_created	\N	Mercedes S-Class	VIP passenger - please arrange premium service	Black	\N	\N	\N	\N	\N	\N	\N
646f5260-bc6c-44a8-8bdc-3e0f3bbd036a	Ahmed Al Mansouri	+971501234567	Dubai International Airport	Dubai International Airport	60	450	luxury	pending	2025-11-30 18:36:31.09409	\N	\N	\N	cash	\N	2025-11-30 18:36:31.09409	2	1	round_trip	\N	\N	jacketscapital@gmail.com	manually_created	\N	Mercedes S-Class	VIP passenger - please arrange premium service	Black	\N	\N	\N	\N	\N	\N	\N
d5d1c965-6fd2-4f62-8325-07d9fb7b3689	Test Customer	+971500000000	Mall of Emirates	Mall of Emirates	40	340	luxury	pending	2025-11-30 18:43:39.178592	\N	\N	\N	cash	\N	2025-11-30 18:43:39.178592	1	0	round_trip	\N	\N	jacketscapital@gmail.com	manually_created	\N	BMW 7-Series	Test booking with email	Silver	\N	\N	\N	\N	\N	\N	\N
2d37275f-b0ff-4dd2-8f6d-c656ef11ae21	Test Email	+971501111111	Dubai Airport Terminal 3	Dubai Airport Terminal 3	50	440	luxury	pending	2025-11-30 18:45:57.638647	\N	\N	\N	cash	\N	2025-11-30 18:45:57.638647	1	0	round_trip	\N	\N	jacketscapital@gmail.com	manually_created	\N	Mercedes E-Class	Email test booking	White	\N	\N	\N	\N	\N	\N	\N
47e2c37c-593f-49d9-b9f5-0b46369dbfaf	Customer Test	+971502222222	Dubai International Airport	Dubai International Airport	60	450	luxury	pending	2025-11-30 18:49:28.273763	\N	\N	\N	cash	\N	2025-11-30 18:49:28.273763	2	1	round_trip	\N	\N	test@example.com	manually_created	\N	BMW 7-Series	Test booking - email should go to aizaz.dmp@gmail.com	Black	\N	\N	\N	\N	\N	\N	\N
fb831fa5-f3ce-490f-a290-13a078af6510	Ahmed Al Mansouri	0501234567	Dubai Mall	Burj Khalifa	\N	450.00	luxury	completed	2025-12-07 13:47:59.551812	\N	\N	\N	cash	\N	2025-12-12 13:47:59.551812	2	0	hourly	\N	\N	\N	manually_created	\N	Mercedes S-Class	VIP transport	Black	6	75.00	\N	\N	\N	\N	\N
0e8605dd-a53d-476b-8678-09c8f583cd16	Final Test	+971503333333	Abu Dhabi International Airport	Abu Dhabi International Airport	70	550	luxury	pending	2025-11-30 18:50:11.827768	\N	\N	\N	cash	\N	2025-11-30 18:50:11.827768	3	2	round_trip	\N	\N	irrelevant@example.com	manually_created	\N	Rolls Royce	Email should arrive at aizaz.dmp@gmail.com	Gold	\N	\N	\N	\N	\N	\N	\N
79d7326c-824a-4a98-b421-e66a715191e6	Ahmed Al Mansouri	+971504444444	Dubai International Airport	Dubai International Airport	50	410	luxury	pending	2025-11-30 18:54:21.673217	\N	\N	\N	cash	\N	2025-11-30 18:54:21.673217	2	1	round_trip	\N	\N	irrelevant@example.com	manually_created	\N	Mercedes S-Class	VIP client - please provide premium service with complimentary water	Black	\N	\N	\N	\N	\N	\N	\N
bf6ff4b1-7b3b-4a37-9ae8-ff57a5676c1e	Ahmed Mohammed	+971501111111	Dubai Marina	Dubai Airport	\N	65.50	\N	completed	2025-11-24 22:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
dba63652-2032-498d-941e-b8d6fa7b840a	Fatima Ali	+971502222222	Business Bay	DIFC	\N	45.75	\N	completed	2025-11-25 10:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
20af6a71-e054-4b9d-81b7-4b00265b0556	Mohammed Hassan	+971503333333	Downtown Dubai	Burj Khalifa	\N	25.00	\N	completed	2025-11-25 22:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
6f081a85-ea6a-4cbc-88ab-4ef84017013d	Noor Ibrahim	+971504444444	Sheikh Zayed Road	Palm Jumeirah	\N	95.00	\N	completed	2025-11-26 22:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
645c92a3-7866-4b0a-bff7-4457877e5c7c	Khalid Khan	+971505555555	Dubai Marina	Downtown Dubai	\N	55.25	\N	pending	2025-11-27 22:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
688f6f44-9836-4915-903f-2679a7bb9a6c	Sara Ahmed	+971506666666	Business Bay	Dubai Airport	\N	75.00	\N	completed	2025-11-28 22:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7475361c-0f85-4e0e-add9-8092d8cfdace	Omar Hassan	+971507777777	DIFC	Jumeirah Beach	\N	85.50	\N	completed	2025-11-29 22:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b2d0f901-3471-4ba8-ac3c-5e08cd74afed	Leila Mohammed	+971508888888	Downtown Dubai	Dubai Marina	\N	45.00	\N	completed	2025-11-30 10:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d64680bc-54e2-417b-8f1a-ab3ff5e530b0	Ali Hassan	+971509999999	Sheikh Zayed Road	DIFC	\N	35.75	\N	pending	2025-11-30 22:36:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
56197690-8563-4827-9b79-f3f5af21bc17	Hana Ali	+971500000000	Burj Khalifa	Palm Jumeirah	\N	65.00	\N	completed	2025-11-30 22:06:23.763408	\N	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2025-11-30 22:36:23.763408	1	0	point-to-point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7dcfd154-9724-4100-9617-220f94cdeba5	Hassan	+9715310671459	Business Bay	Dubai Mall	17	64.5	classic	completed	2025-11-23 10:51:55.263563	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-23 10:51:55.263563	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
5d1076e0-99d8-48ce-acb9-51e4b2be0712	Hassan	+9715704503899	Dubai Marina	Dubai Mall	37	134.5	classic	completed	2025-11-20 15:00:55.719027	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-20 15:00:55.719027	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
702e5f1d-bd55-45dd-af17-78946d9ecbfa	Aisha	+9715902917062	Mall of Emirates	Atlantis The Palm	5	22.5	classic	completed	2025-11-24 07:11:55.946309	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	32b6548e-dd3a-4e12-b045-759671263394	2025-11-24 07:11:55.946309	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
55e0f625-2449-4859-9a33-ba9129a20009	Omar	+9715594516905	Abu Dhabi	JBR	49	176.5	classic	completed	2025-11-24 01:04:56.173599	1d0ac375-e4c6-4fce-8db6-60bbda20931a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-24 01:04:56.173599	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c6f44826-7521-4c5d-8536-af2f1ef0e293	Fatima	+9715334783514	Jumeirah Beach	Dubai Mall	37	134.5	classic	completed	2025-11-20 07:46:56.855209	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	bb37d0b3-5956-4644-85f1-d9fc441cc7a4	2025-11-20 07:46:56.855209	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a766569b-a0ff-45e5-8b2a-6af4e29a7e05	Hassan	+9715418701878	Dubai Marina	Emirates Towers	9	36.5	classic	completed	2025-11-22 06:29:58.683587	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-22 06:29:58.683587	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
baf3cf76-e027-43bb-8581-b9d2ce2496a1	Sara	+9715937010049	Dubai Marina	Marina	47	169.5	classic	completed	2025-11-22 17:55:59.821179	d0e18893-9cee-45ff-9d55-37951100b64b	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-22 17:55:59.821179	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
124ce98b-a2ec-4f7e-9927-3b2f1775643b	Ahmed	+9715500820662	Sharjah	Convention Centre	20	75	classic	pending	2025-11-20 12:18:00.50336	bf2f71f5-7e19-4f57-b251-251c87ee6c66	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	ba981095-24ed-4cdb-9f6a-b450e5fe9e99	2025-11-20 12:18:00.50336	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
839c886b-6e96-4059-aaef-4788bf7c72b0	Aisha	+9715313139568	Deira	Atlantis The Palm	23	85.5	classic	completed	2025-11-23 00:47:01.412128	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-23 00:47:01.412128	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9d6c607c-7e36-491e-856b-e8359ba34135	Ahmed	+9715407822539	Burj Khalifa	JBR	48	173	classic	completed	2025-11-25 19:47:01.638887	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	7983e2e1-14b7-49bd-a15f-988038a17e51	2025-11-25 19:47:01.638887	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a4d21f84-96da-453d-94f0-cbf27aefc015	Sara	+9715304221358	Dubai Airport	Airport Hotel	49	176.5	classic	completed	2025-11-21 06:03:02.09566	31278e30-8220-4ce1-ab93-b739d0afe503	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-11-21 06:03:02.09566	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ac42acc9-7f98-4ebb-b753-288a4b167d9b	Omar	+9715451627402	Jumeirah Beach	Convention Centre	31	113.5	classic	pending	2025-11-20 19:36:02.322941	d0e18893-9cee-45ff-9d55-37951100b64b	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-20 19:36:02.322941	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
94bf54c6-6635-470d-a88f-45b5ad1ba9ed	Ahmed	+9715546457536	Jumeirah Beach	Marina	36	131	classic	completed	2025-11-23 00:50:02.778957	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	dd639c64-7587-4d69-a4ca-86dfafb00e5c	2025-11-23 00:50:02.778957	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
10bd8833-0d45-45ec-8de9-ef0f7020939f	Fatima	+9715039916225	Jumeirah Beach	Emirates Towers	21	78.5	classic	completed	2025-11-23 18:46:05.283229	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-23 18:46:05.283229	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c83d1a31-8b48-4b73-b7d8-a6b3db781420	Ahmed	+9715297274411	Abu Dhabi	JBR	14	54	classic	completed	2025-11-26 04:54:05.738455	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	b5d713bb-17d8-4c02-ba03-5beb243c79e8	2025-11-26 04:54:05.738455	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
d4f9b0b0-ef3c-401c-8343-91ae04bcf557	Omar	+9715014973710	Dubai Airport	Airport Hotel	34	124	classic	completed	2025-11-24 20:10:06.192824	bf2f71f5-7e19-4f57-b251-251c87ee6c66	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	bb37d0b3-5956-4644-85f1-d9fc441cc7a4	2025-11-24 20:10:06.192824	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
e4cc6972-a803-48d6-b24b-d68bce6d8813	Sara	+9715454643405	Sharjah	Convention Centre	16	61	classic	completed	2025-11-20 11:36:06.646648	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	ba981095-24ed-4cdb-9f6a-b450e5fe9e99	2025-11-20 11:36:06.646648	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
77a8295c-175c-41ae-a350-60f06ba68900	Ali	+9715552328366	Burj Khalifa	Deira City Center	34	124	classic	pending	2025-11-25 13:19:07.556696	da82e6c3-bacc-404a-b7e5-7095e832adfa	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-25 13:19:07.556696	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
7ecaa0c4-f4e8-4854-b4f6-52aa98cc3617	Hassan	+9715829406399	Burj Khalifa	Deira City Center	15	57.5	classic	cancelled	2025-11-21 07:11:07.784418	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	dd639c64-7587-4d69-a4ca-86dfafb00e5c	2025-11-21 07:11:07.784418	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
eef8c11a-5496-4fd5-8b13-a0985d489607	Sara	+9715833980204	Burj Khalifa	Emirates Towers	44	159	classic	completed	2025-11-25 02:37:08.011543	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-25 02:37:08.011543	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
0ca3f768-f360-43e8-9c9d-7885a9282f86	Aisha	+9715795020983	Deira	Airport Hotel	34	124	classic	completed	2025-11-23 02:07:08.238353	7ad96261-ddbc-4a64-b177-7575d522071c	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-23 02:07:08.238353	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
b12e2029-4709-4fe0-91df-354962291175	Omar	+9715706097780	Jumeirah Beach	Downtown	22	82	classic	completed	2025-11-20 05:48:08.920515	d0e18893-9cee-45ff-9d55-37951100b64b	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-20 05:48:08.920515	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
c7a1b1dc-9f3e-40ae-a140-529a7f5ce966	Ali	+9715022638624	Deira	Marina	19	71.5	classic	completed	2025-11-20 05:19:09.602179	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	26bcd573-1af6-4698-8990-8e95a063635a	2025-11-20 05:19:09.602179	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
15ef775a-adb2-45ef-b5c6-80c7b7ecd33d	Sara	+9715474173813	Sharjah	Marina	47	169.5	classic	completed	2025-11-20 01:01:09.832845	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	ba981095-24ed-4cdb-9f6a-b450e5fe9e99	2025-11-20 01:01:09.832845	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
72d4f01e-7e2d-44f6-97bb-0571a82659df	Fatima	+9715491661176	Deira	Dubai Mall	41	148.5	classic	completed	2025-11-25 00:22:10.514468	7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	card	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-11-25 00:22:10.514468	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
ca54232c-daf5-4957-ae5a-43919df7cc7d	Aisha	+9715959699328	Dubai Marina	Jumeirah Beach	45	162.5	classic	pending	2025-11-25 04:07:10.744046	d0e18893-9cee-45ff-9d55-37951100b64b	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-25 04:07:10.744046	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
733eb425-d5ac-4bcf-a85e-5536636be91c	Fatima	+9715825721389	Burj Khalifa	Atlantis The Palm	9	36.5	classic	completed	2025-11-26 15:43:11.42655	1d0ac375-e4c6-4fce-8db6-60bbda20931a	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-11-26 15:43:11.42655	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
323aaa80-1fd1-4d40-9255-06ff32b488ea	Aisha	+9715756081725	Dubai Airport	Airport Hotel	21	78.5	classic	pending	2025-11-24 23:02:12.108759	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-24 23:02:12.108759	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
a77de183-e8bc-493e-889e-0be4975a74e6	Bareerah Test	+971501234567	Dubai Airport	Burj Khalifa	30	105	classic	in-process	2025-11-30 01:37:52.549975	31278e30-8220-4ce1-ab93-b739d0afe503	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 01:37:52.549975	2	1	point_to_point	\N	\N	bareerah@test.com	manually_created	\N	BMW 5 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
5692d165-273b-4ddc-9bf2-a5ac5308baa7	Bareerah Full Test	+971501234567	Dubai Airport	Burj Khalifa	30	105	classic	in-process	2025-11-30 01:39:35.293954	31278e30-8220-4ce1-ab93-b739d0afe503	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 01:39:35.293954	2	1	point_to_point	\N	\N	bareerah@test.com	bareerah_ai	\N	BMW 5 Series	\N	\N	\N	\N	\N	\N	\N	\N	\N
18f35c48-cbe6-45d4-adb0-4d8f881a2e35	Ali Point-to-Point TEST	+971503456789	Mall of the Emirates	Downtown Dubai	18	0	classic	in-process	2025-11-30 18:02:22.148894	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	\N	\N	cash	eff7f1c9-476d-4be1-b65d-572f9be22464	2025-11-30 18:02:22.148894	1	0	point_to_point	\N	\N	cs@jacketscapital.com	manually_created	\N	Toyota Camry	\N	\N	\N	\N	\N	\N	\N	\N	\N
2446d5f7-2ca7-4405-be55-23c23800c186	Aisha	+9715996219445	Sharjah	JBR	19	90.5	urban_suv	pending	2025-11-26 05:37:54.122769	31278e30-8220-4ce1-ab93-b739d0afe503	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	card	ba981095-24ed-4cdb-9f6a-b450e5fe9e99	2025-11-26 05:37:54.122769	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
97c67c8c-939d-43ea-a409-114f7294aabb	Ali	+9715249290510	Deira	Downtown	48	221	urban_suv	completed	2025-11-25 20:44:12.563881	da82e6c3-bacc-404a-b7e5-7095e832adfa	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	cash	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	2025-11-25 20:44:12.563881	1	0	point_to_point	\N	\N	\N	manually_created	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
9fb33009-ee92-415f-9a38-4a8fbe86571a	Fatima Al Zahra	0559876543	Emirates Mall	BurJuman Centre	\N	350.00	executive	completed	2025-12-08 13:47:59.551812	\N	\N	\N	cash	\N	2025-12-12 13:47:59.551812	1	1	hourly	\N	\N	\N	manually_created	\N	BMW 7 Series	Shopping tour	White	5	70.00	\N	\N	\N	\N	\N
ed9a3ef1-3f81-4c46-ad17-505e0a9cfd59	Mohammad Hassan	0551112222	JBR Beach	Marina Mall	\N	520.00	elite_van	in-process	2025-12-09 13:47:59.551812	\N	\N	\N	cash	\N	2025-12-12 13:47:59.551812	4	2	hourly	\N	\N	\N	bareerah_ai	\N	Toyota Hiace	Family outing	Silver	7	75.00	\N	\N	\N	\N	\N
75e19b34-a1c6-4208-91fd-baac557687e5	Rashid Al Dhaheri	0555556666	Dubai Airport Terminal 3	Downtown Dubai	\N	480.00	first_class	completed	2025-12-11 13:47:59.551812	\N	\N	\N	cash	\N	2025-12-12 13:47:59.551812	3	3	hourly	\N	\N	\N	manually_created	\N	Audi A8	Airport service	Blue	8	60.00	\N	\N	\N	\N	\N
5d49d166-8704-4779-999f-2e5654d49c21	Lina Al Maktoum	0507778888	Mall of the Emirates	Gold Souk	\N	320.00	executive	completed	2025-12-12 07:47:59.551812	\N	\N	\N	cash	\N	2025-12-12 13:47:59.551812	2	1	hourly	\N	\N	\N	manually_created	\N	Lexus LS	Shopping tour	Gold	4	80.00	\N	\N	\N	\N	\N
0f07cd4e-2762-4cbd-b869-5c5f91cba953	M Rameez Ul Haq	+9718877992211	Dubai International Airport	Dubai Marina	15	99	executive	pending	2025-12-15 17:03:53.005431	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-12-15 17:03:53.005431	3	2	point_to_point	\N	\N	admin@digitalminds.pk	wordpress	\N	Lexus ES 300H	Child Seats: 0 (Seat: 0, Booster: 0, Infant: 0) | Pickup: 2025-12-15 @ 12:34	Silver	\N	\N	2025-12-15 12:34:00	\N	\N	\N	\N
82ab6988-fef7-4b75-837e-ad25e45c5cdb	All right.	+16186880438	Dubai Marina Mall	Dubai International Airport Terminal 3	10	40	classic	pending	2025-11-26 18:29:02.758747	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-27 17:26:06.470558	1	0	point_to_point	\N	\N	\N	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
8df37804-487a-4f25-8cfe-647bba86dca5	M Rameez Ul Haq	03212237788	Zabeel Park	Emirates Hills	31.6	110.6	classic	pending	2025-11-28 14:51:04.910801	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-28 14:51:04.910801	1	0	point_to_point	\N	\N	a@a.com	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
932d28be-d228-42e2-8bf9-ab98df808168	M Rameez Ul Haq	03212237788	Zabeel Park	Emirates Hills	31.6	110.6	classic	pending	2025-11-28 14:40:42.980411	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-28 15:37:05.111247	1	0	point_to_point	\N	\N	a@a.com	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
67da17a8-1392-48d3-befd-47ccf26388c5	Sarah Johnson	0509998877	Jumeirah Beach Hotel	Al Qasr	\N	400.00	luxury_suv	pending	2025-12-10 13:47:59.551812	c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	\N	\N	cash	\N	2025-12-12 13:47:59.551812	2	0	hourly	\N	\N	\N	wordpress	\N	Cadillac Escalade	Airport transfer	Gray	6	65.00	\N	\N	\N	\N	\N
57745aed-15a5-40f7-b383-65f7f335e385	jawad nazari	+971354854874	Business Bay	Arabian Ranches	15	54.44	luxury_suv	pending	2025-12-15 16:10:56.135648	c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	\N	\N	cash	\N	2025-12-15 16:10:56.135648	5	4	point_to_point	\N	\N	test@gmail.com	wordpress	\N	Cadillac Escalade	Child Seats: 2 (Seat: 1, Booster: 1, Infant: 0) | Pickup: 2025-12-15 @ 08:08 | Child Seats: 2 | WhatsApp: +971	Gray	\N	\N	\N	\N	\N	\N	\N
45306e8d-cf26-4d7f-b5af-ad7e12b3f894	Aizaz Khan	+971354854874	Dubai Hills Estate	Dubai Hills Estate	15	81.66	executive	pending	2025-12-15 16:21:40.443217	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-12-15 16:21:40.443217	3	2	round_trip	\N	\N	aizaz.dmp@gmail.com	wordpress	\N	Lexus ES 300H	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-26 @ 08:24 | Return: 2025-12-27 @ 11:22 | Child Seats: 3	Silver	\N	\N	\N	\N	\N	\N	\N
217a65cb-3893-4471-9bb9-ec7e7cb753c1	jawad nazari	+971354854874	jawad	Fujairah Airport	15	119.78	classic	pending	2025-12-15 08:58:08.419398	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-15 08:58:08.419398	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	Toyota Hiace	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-17 @ 13:00 | Child Seats: 3	Black	\N	\N	\N	\N	\N	\N	\N
49c7abd4-6874-47cf-a648-0e405a7856e5	jawad nazari	+971354854874	Fujairah Airport	Burjeel Hospital Dubai	15	201.44	classic	pending	2025-12-15 12:16:58.133204	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-15 12:16:58.133204	3	2	round_trip	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	Toyota Hiace	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2025-12-16 @ 17:14 | Return: 2025-12-16 @ 09:15 | Child Seats: 6	Black	\N	\N	\N	\N	\N	\N	\N
1e9e154c-1f1d-4140-9c9c-5485b3168831	Jawad Test	+971501234567	Dubai Mall	Abu Dhabi Airport	15	225.5	classic	pending	2025-12-09 15:58:50.437237	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-09 15:58:50.437237	3	2	point_to_point	\N	\N	jawad@test.com	wordpress	\N	Toyota Hiace	Please arrive 10 mins early | Pickup: December 15, 2025 @ 7:01 PM | Stop: Dubai Marina | Child Seats: 2 | WhatsApp: +971509876543	Black	\N	\N	\N	\N	\N	\N	\N
e48332ac-deef-4446-abf6-32b7c3db4b7b	Jawad Test	+971501234567	Dubai Mall	Abu Dhabi Airport	15	225.5	classic	pending	2025-12-09 16:01:17.435685	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-09 16:01:17.435685	3	2	point_to_point	\N	\N	jawad@test.com	wordpress	\N	Toyota Hiace	Please arrive 10 mins early | Pickup: December 15, 2025 @ 7:01 PM | Stop: Dubai Marina | Child Seats: 2 | WhatsApp: +971509876543	Black	\N	\N	\N	\N	\N	\N	\N
01e3226e-7e96-4927-8a88-c6e7bc5da761	Jawad Test	+971501234567	Dubai Mall	Abu Dhabi Airport	15	225.5	classic	pending	2025-12-09 16:01:31.170708	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-09 16:01:31.170708	3	2	point_to_point	\N	\N	jawad@test.com	wordpress	\N	Toyota Hiace	Please arrive 10 mins early | Pickup: December 15, 2025 @ 7:01 PM | Stop: Dubai Marina | Child Seats: 2 | WhatsApp: +971509876543	Black	\N	\N	\N	\N	\N	\N	\N
d54bf80d-16cd-4a70-8a69-b551d7ed8c80	Test	+0000000000	Dubai	Airport	10	38.5	classic	in-process	2025-11-29 23:09:38.124197	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-29 23:09:38.124197	1	0	airport_transfer	\N	\N	\N	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
78c97ed8-08c1-4b50-aefd-05e8e633276d	Test	+0000000000	Dubai	Airport	10	38.5	classic	in-process	2025-11-29 23:21:06.932189	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-29 23:21:06.932189	1	0	airport_transfer	\N	\N	\N	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
e5ae9430-b264-49dc-a470-eaf449fcfaa6	Test	+0000000000	Dubai	Airport	10	38.5	classic	in-process	2025-11-29 23:27:06.675999	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-29 23:27:06.675999	1	0	airport_transfer	\N	\N	\N	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
0680f7f1-6c93-400e-a994-5a65947117eb	Test	+0000000000	Dubai	Airport	10	38.5	classic	in-process	2025-11-29 23:28:28.14793	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-29 23:28:28.14793	1	0	airport_transfer	\N	\N	\N	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
77d3aa61-40f2-4b9e-b546-28d6da4e141f	Test	+0000000000	Dubai	Airport	10	38.5	classic	in-process	2025-11-30 00:35:27.079932	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 01:01:31.810836	1	0	airport_transfer	\N	\N	\N	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
0e87b400-e2df-431e-8300-b534f25876b6	Muhammad Ali Raza	 923001234001	Dubai Mall	Atlantis Hotel	25.27	88.45	classic	in-process	2025-11-30 01:15:20.442197	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 01:15:20.442197	2	1	point_to_point	\N	\N	ali.raza@gmail.com	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
a31e23df-ed7f-4dd5-bb82-54c70fb0588d	Fatima Khan	 923009876542	Dubai International Airport	Burj Khalifa	15.63	54.71	classic	in-process	2025-11-30 01:16:02.883837	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 01:16:02.883837	1	2	point_to_point	\N	\N	fatima.khan@outlook.com	manually_created	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
6bf9f768-8885-4de9-b8b1-a06e8f285ab7	Test Bareerah	+971501234567	Dubai Airport	Burj Khalifa	30	105	classic	in-process	2025-11-30 01:20:50.828423	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-11-30 01:20:50.828423	2	1	point_to_point	\N	\N	\N	bareerah_ai	\N	Toyota Hiace	\N	Black	\N	\N	\N	\N	\N	\N	\N
9cbdb802-9d43-466d-b893-d6e3b7c5dcdc	Hassan Khan	0554443333	Business Bay	DIFC	\N	210.00	classic	pending	2025-12-12 11:47:59.551812	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-12 13:47:59.551812	1	0	hourly	\N	\N	\N	bareerah_ai	\N	Toyota Hiace	Business meeting	Black	3	70.00	\N	\N	\N	\N	\N
6ef63fbf-08dc-4316-abeb-1623d71432b5	dnyl!	+16186880438	Dubai Marina Mall	dubai international airport	35.28	68.76	suv	in-process	2025-12-10 19:01:32.96557	7da8aa3f-8701-48d7-81e9-6abba62dd860	\N	\N	cash	32b6548e-dd3a-4e12-b045-759671263394	2025-12-10 19:01:32.96557	3	4	point_to_point	\N	\N	\N	manually_created	\N	Toyota Highlander	ll skrt!	Black	\N	\N	2025-12-09 16:00:00	\N	\N	\N	\N
cdebdb0c-f399-467d-ba64-f62ceaa36c03	M Rameez Ul Haq	+9718877992211	Dubai International Airport	Dubai Marina	15	99	urban_suv	assigned	2025-12-15 17:18:58.571203	7da8aa3f-8701-48d7-81e9-6abba62dd860	\N	\N	cash	32b6548e-dd3a-4e12-b045-759671263394	2025-12-15 17:18:58.571203	5	4	point_to_point	\N	\N	admin@digitalminds.pk	wordpress	\N	Toyota Highlander	Child Seats: 0 (Seat: 0, Booster: 0, Infant: 0) | Pickup: 2025-12-15 @ 12:34	Black	\N	\N	2025-12-15 12:34:00	\N	\N	\N	\N
6aa642e2-b852-4579-b7a5-11b48ca02121	M Rameez Ul Haq	03212237788	Deira Corniche	Emirates Hills	41.8	453.15	luxury	in-process	2025-12-15 17:21:56.049905	ab209cb6-cba3-4f61-b265-380ca4085cb8	\N	\N	cash	\N	2025-12-15 17:21:56.049905	1	0	point_to_point	\N	\N	a@a.com	manually_created	\N	Range Rover	\N	Silver	\N	\N	2025-12-16 13:20:00	\N	\N	\N	\N
d442b86c-a7cc-4a30-9969-74e336b6de85	jawad nazari	+971354854874	Fujairah Airport	Dubai Airport Terminal 2	15	81.66	elite_van	pending	2025-12-16 13:49:39.114841	\N	\N	\N	cash	\N	2025-12-16 13:49:39.114841	7	7	round_trip	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-17 @ 09:50 | Return: 2025-12-18 @ 10:52 | Child Seats: 3	\N	\N	\N	\N	\N	\N	\N	\N
d7fc9d56-7b86-44c2-8716-b01db1c1f5b1	test	+971354854874	Mall of the Emirates	Dubai Festival City	15	81.66	executive	pending	2025-12-16 14:22:52.875002	\N	\N	\N	cash	\N	2025-12-16 14:22:52.875002	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 2, Booster: 1, Infant: 0) | Pickup: 2025-12-16 @ 19:22 | Child Seats: 3	\N	\N	\N	\N	\N	\N	\N	\N
d87e853a-5d61-4295-84b5-43014bf5b3a7	nazar	+971354854874	Sharjah Hills	Al Maktoum Airport	15	81.66	classic	pending	2025-12-16 14:55:19.761717	\N	\N	\N	cash	\N	2025-12-16 14:55:19.761717	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-16 @ 19:54 | Child Seats: 3	\N	\N	\N	\N	\N	\N	\N	\N
3641d675-a3ff-4aac-91eb-a5bb9b8bb856	Usman 	+9710559033884	Abu Dhabi International Airport	g	15	54.44	executive	pending	2025-12-16 15:26:36.867485	\N	\N	\N	cash	\N	2025-12-16 15:26:36.867485	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 2 (Seat: 1, Booster: 1, Infant: 0) | Pickup: 2025-12-16 @ 20:25 | Child Seats: 2	\N	\N	\N	\N	\N	\N	\N	\N
940626a0-a872-4e3e-8661-84e9afddb254	nazari	+971354854874	Business Bay	Dubai International Airport	15	54.44	first_class	pending	2025-12-16 16:06:47.523797	\N	\N	\N	cash	\N	2025-12-16 16:06:47.523797	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 2 (Seat: 1, Booster: 1, Infant: 0) | Pickup: 2025-12-16 @ 21:06 | Child Seats: 2	\N	\N	\N	\N	\N	\N	\N	\N
de6f5dbb-e4ec-49c8-a71a-4c101861c118	test	+971354854874	Burj Khalifa	Dubai International Airport	15	54.44	elite_van	pending	2025-12-16 16:33:22.401007	\N	\N	\N	cash	\N	2025-12-16 16:33:22.401007	7	7	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 2 (Seat: 1, Booster: 1, Infant: 0) | Pickup: 2025-12-16 @ 21:32 | Child Seats: 2	\N	\N	\N	\N	\N	\N	\N	\N
91a4c03a-75e2-417d-8f12-c7b54ab6e2e9	asad	+971354854874	DWC	Dubai International Airport	15	81.66	elite_van	pending	2025-12-16 16:43:50.423003	\N	\N	\N	cash	\N	2025-12-16 16:43:50.423003	7	7	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-16 @ 21:43 | Child Seats: 3	\N	\N	\N	\N	\N	\N	\N	\N
5d80dd53-3411-4973-a49e-b907ad0833f2	Aizaz Khan	+9718877992211	Burj Khalifa	DWC	15	119.78	executive	assigned	2025-12-18 12:40:33.742086	7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	\N	\N	cash	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-12-18 12:40:33.742086	3	2	point_to_point	\N	\N	aizaz.dmp@gmail.com	wordpress	\N	Lexus ES 300H	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-18 @ 17:39 | Child Seats: 3	Silver	\N	\N	2025-12-18 17:39:00	\N	\N	\N	\N
a47ddc1c-1b1f-491b-a9be-04cbcfe82e96	Aizaz Khan	03212237788	Dubai Old Town	Emirates Hills	16.4	0	sedan	in-process	2025-12-18 13:08:05.715097	\N	\N	\N	cash	\N	2025-12-18 13:08:05.715097	1	1	point_to_point	\N	\N	a@a.com	manually_created	\N	Honda Civic	\N	\N	\N	\N	2025-12-19 18:07:00	\N	\N	\N	\N
414428d4-0c65-4b73-85ec-e52554c63031	JIM	030548784564	Al Jahili Fort Al Ain	Al Furjan	11.3	450	luxury	in-process	2025-12-18 14:16:56.004217	ab209cb6-cba3-4f61-b265-380ca4085cb8	\N	\N	cash	\N	2025-12-18 14:16:56.004217	1	1	point_to_point	\N	\N	jim@gmail.com	manually_created	\N	Range Rover	\N	Silver	\N	\N	2025-12-19 21:18:00	\N	\N	\N	\N
13561e49-9be8-4ce0-89a4-79e9a90a12f9	Aizaz Khan	03212237788	Burj Khalifa	Burj Khalifa	2	0	suv	in-process	2025-12-19 10:14:05.355275	\N	\N	\N	cash	\N	2025-12-19 10:14:05.355275	1	0	point_to_point	\N	\N	a@a.com	manually_created	\N	Ford Explorer	\N	\N	\N	\N	2025-12-19 15:13:00	\N	\N	\N	\N
115d536f-21fd-49eb-92af-1aa1dcf90005	fazi	+97103545454545	Ajman Airport	Fujairah Airport	15	119.78	executive	assigned	2025-12-19 10:31:12.21085	d32e7b7e-7468-4b71-8fbe-627207d31156	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-19 10:31:12.21085	3	2	round_trip	\N	\N	fazi@gmail.com	wordpress	\N	Lexus ES 300H	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-20 @ 16:30 | Return: 2025-12-20 @ 18:33 | Child Seats: 3	Silver	\N	\N	2025-12-20 16:30:00	\N	\N	\N	\N
1eee2abb-48da-4ddc-9d3f-259bf4ed71ac	jhon	030548784564	Al Jahili Fort Al Ain	Al Furjan	32.6	56.7	suv	in-process	2025-12-19 10:53:04.28237	\N	\N	\N	cash	\N	2025-12-19 10:53:04.28237	1	0	point_to_point	\N	\N	jim@gmail.com	manually_created	\N	Ford Explorer	\N	\N	\N	\N	2025-12-20 18:55:00	\N	\N	\N	\N
c147b38f-33b8-4c53-8350-e4d5c6eadb29	test	030548784564	Al Jahili Fort Al Ain	Al Furjan	15.3	0	van	in-process	2025-12-19 11:18:20.830982	\N	\N	\N	cash	\N	2025-12-19 11:18:20.830982	1	1	point_to_point	\N	\N	jim@gmail.com	manually_created	\N	Mercedes V Class	\N	\N	\N	\N	2025-12-20 19:21:00	\N	\N	\N	\N
9af273b9-8b48-4696-b115-7ba25fa494e9	admed	+97103545454545	ahmed	Dubai Airport Terminal 1	15	81.66	executive	assigned	2025-12-19 11:27:59.262772	a828f965-94da-4307-ba82-edbb9be30672	\N	\N	cash	\N	2025-12-19 11:27:59.262772	3	2	point_to_point	\N	\N	digitalminds.pk@gmail.com	wordpress	\N	Tesla Model 3	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-19 @ 16:27 | Child Seats: 3	Black	\N	\N	2025-12-19 16:27:00	\N	\N	\N	\N
44f1b2c8-b4a7-4a6c-8ae4-0a9d8082b4d7	test	+97103545454545	DWC	Dubai International Airport	15	65.34	classic	assigned	2025-12-19 11:35:42.396181	89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	\N	\N	cash	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	2025-12-19 11:35:42.396181	3	2	point_to_point	\N	\N	digitalminds.pk@gmail.com	wordpress	\N	Toyota Hiace	Child Seats: 1 (Seat: 1, Booster: 0, Infant: 0) | Pickup: 2025-12-19 @ 16:35 | Child Seats: 1	Black	\N	\N	2025-12-19 16:35:00	\N	\N	\N	\N
b9ca9bb0-cd00-46cb-a3ea-fd34c02e0706	JIM	+97103545454545	Business Bay	Al Maktoum Airport	15	119.78	urban_suv	assigned	2025-12-19 11:37:54.294071	25e647ca-92a5-4c3b-bb54-9b4be85f7a37	\N	\N	card	0aceffab-516f-43dc-8cc4-48bae23dec69	2025-12-19 11:37:54.294071	5	4	point_to_point	\N	\N	digitalminds.pk@gmail.com	wordpress	\N	Toyota Highlander	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-19 @ 16:37 | Child Seats: 3 | WhatsApp: +971	Black	\N	\N	2025-12-19 16:37:00	\N	\N	\N	\N
c06eeb74-62ba-482f-9d6f-99070c1c8650	jawad	+97103545454545	DXB	Dubai Airport Terminal 1	15	147	executive	assigned	2025-12-19 11:45:06.398066	90f98f0f-ff38-403a-a88f-af437a607489	\N	\N	cash	\N	2025-12-19 11:45:06.398066	3	2	point_to_point	\N	\N	digitalminds.pk@gmail.com	wordpress	\N	Tesla Model Y	Child Seats: 4 (Seat: 2, Booster: 1, Infant: 1) | Pickup: 2025-12-19 @ 16:44 | Child Seats: 4	Black	\N	\N	2025-12-19 16:44:00	\N	\N	\N	\N
4cf9e0c5-5957-4eba-b840-367b4a53a27c	test	+97103545454545	Sharjah International Airport	Sheikh Zayed Grand Mosque	15	119.78	executive	assigned	2025-12-19 12:01:31.077102	e4b8d71a-3ce6-4882-ba90-bcf747595eb6	\N	\N	cash	\N	2025-12-19 12:01:31.077102	3	2	point_to_point	\N	\N	digitalminds.pk@gmail.com	wordpress	\N	Mercedes E Class	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-19 @ 17:00 | Child Seats: 3	Black	\N	\N	2025-12-19 17:00:00	\N	\N	\N	\N
d8f04059-abef-48fa-a80c-613626bf8001	jawad nazari	354854874	Jebel Ali Port	Dubai Old Town	25	450	luxury	in-process	2025-12-22 09:07:15.695267	ab209cb6-cba3-4f61-b265-380ca4085cb8	\N	\N	cash	\N	2025-12-22 09:07:15.695267	1	1	point_to_point	\N	\N	test@gmail.com	manually_created	\N	Range Rover	\N	Silver	\N	\N	2025-12-23 18:10:00	\N	\N	\N	\N
34eba634-b81a-4160-82e0-508999e3db5b	Aizaz Khan	+9718877992211	Sharjah International Airport	Dubai International Airport	15	119.78	executive	pending	2025-12-22 10:03:00.854732	\N	\N	\N	cash	\N	2025-12-22 10:03:00.854732	3	2	point_to_point	\N	\N	aizaz.dmp@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-22 @ 14:58 | Child Seats: 3	\N	\N	\N	2025-12-22 14:58:00	\N	\N	\N	\N
fde1aea9-fa5d-415c-b7f0-68c31911fc13	Aizaz	+9718877992211	Fujairah Airport	Abu Dhabi International Airport	15	147	first_class	assigned	2025-12-22 10:11:15.641333	e5293bbf-8ca0-4ff5-8119-08a8ac35ba8f	\N	\N	cash	21e2dd72-821f-4126-b480-091e8a7d04d4	2025-12-22 10:11:15.641333	3	2	point_to_point	\N	\N	admin@digitalminds.pk	wordpress	\N	BMW 7 Series	Child Seats: 4 (Seat: 2, Booster: 1, Infant: 1) | Pickup: 2025-12-22 @ 15:10 | Stop: cafeshop | Child Seats: 4	Black	\N	\N	2025-12-22 15:10:00	\N	\N	\N	\N
3a387dce-2af9-47af-8573-7b8b1b1ede9c	jawad nazari	+971354854874	Mall of the Emirates	Dubai Festival City	15	119.78	classic	assigned	2025-12-22 11:11:03.146129	e05e9f46-3245-4658-bebe-b478492db40d	\N	\N	cash	bbbb251b-e07d-4434-8c29-9461292d9c51	2025-12-22 11:11:03.146129	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	BYD Han	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-22 @ 16:10 | Child Seats: 3	White	\N	\N	2025-12-22 16:10:00	\N	\N	\N	\N
6a5f0d7a-1212-4007-9f14-8356557e8ea7	jawad nazari	+971354854874	Jumeirah Beach - Jumeirah - Jumeira Third - Dubai - United Arab Emirates	Mena Jabal Ali - Dubai - United Arab Emirates	15	119.78	executive	pending	2025-12-31 18:34:27.312877	\N	\N	\N	cash	\N	2025-12-31 18:34:27.312877	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2025-12-31 @ 23:33 | Child Seats: 3	\N	\N	\N	\N	\N	\N	\N	\N
3453713c-fa95-449c-b3ae-7bfd2858c2d9	jawad nazari	+971354854874	The Walk - Marsa Dubai - Jumeirah Beach Residence - Dubai - United Arab Emirates	Marsa Dubai - Jumeirah Beach Residence - Dubai - United Arab Emirates	15	201.44	executive	pending	2025-12-31 19:54:22.490947	\N	\N	\N	cash	\N	2025-12-31 19:54:22.490947	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 1, Booster: 2, Infant: 3) | Pickup: 2025-12-31 @ 00:52 | Child Seats: 6	\N	\N	\N	2025-12-31 00:52:00	\N	\N	\N	\N
29003007-9ff7-49e6-8e71-1f753572ef80	test	+971354854874	Airport Rd - Al Garhoud - Dubai - United Arab Emirates	1 Sheikh Mohammed bin Rashid Blvd - Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates	15	174.22	elite_van	pending	2026-01-02 18:50:07.956248	\N	\N	\N	cash	\N	2026-01-02 18:50:07.956248	7	7	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 5 (Seat: 1, Booster: 2, Infant: 2) | Pickup: 2026-01-02 @ 23:47 | Child Seats: 5	\N	\N	\N	\N	\N	\N	\N	\N
9962f98a-7ec7-496d-896f-de2333909bec	asad	+971354854874	Dubai - United Arab Emirates	Jumeirah Village - Jumeirah Village Circle - Dubai - United Arab Emirates	15	201.44	elite_van	pending	2026-01-05 11:09:29.231125	\N	\N	\N	cash	\N	2026-01-05 11:09:29.231125	7	7	point_to_point	\N	\N	admin@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 16:06 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
412e303f-213b-4442-a903-40403b036d7b	jawad nazari	+971354854874	Dubai - United Arab Emirates	1 Sheikh Mohammed bin Rashid Blvd - Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates	15	81.66	urban_suv	pending	2026-01-05 11:37:53.263063	\N	\N	\N	cash	\N	2026-01-05 11:37:53.263063	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-05 @ 16:06 | Child Seats: 3	\N	\N	\N	\N	\N	\N	\N	\N
08fad277-fda3-4596-be0d-6ae4192de2e9	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	15	81.66	first_class	pending	2026-01-05 13:12:54.057526	\N	\N	\N	cash	\N	2026-01-05 13:12:54.057526	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-05 @ 18:11 | Child Seats: 3	\N	\N	\N	\N	\N	\N	\N	\N
4219bf68-7bc3-4a58-81f2-f58c26e21546	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	15	190.54	first_class	pending	2026-01-05 13:14:53.742327	\N	\N	\N	cash	\N	2026-01-05 13:14:53.742327	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 7 (Seat: 3, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 18:11 | Child Seats: 7	\N	\N	\N	\N	\N	\N	\N	\N
14b25546-3bd7-4a81-b15c-28c0538cd9d8	asad	+971354854874	Fujairah - United Arab Emirates	Dubai - United Arab Emirates	15	108.88	executive	pending	2026-01-05 13:18:28.338643	\N	\N	\N	cash	\N	2026-01-05 13:18:28.338643	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 4 (Seat: 1, Booster: 2, Infant: 1) | Pickup: 2026-01-05 @ 18:17 | Child Seats: 4	\N	\N	\N	\N	\N	\N	\N	\N
c248f54e-f8fa-478f-a80a-43c5e2fe8dee	jawad nazari	+971354854874	Dubai - United Arab Emirates	Fujairah - United Arab Emirates	15	228.66	executive	pending	2026-01-05 14:08:46.578798	\N	\N	\N	cash	\N	2026-01-05 14:08:46.578798	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 7 (Seat: 2, Booster: 2, Infant: 3) | Pickup: 2026-01-05 @ 19:07 | Child Seats: 7	\N	\N	\N	\N	\N	\N	\N	\N
dc942f3e-1acb-4fad-9242-65491aa03a8a	jawad nazari	+971354854874	Dubai - United Arab Emirates	Fujairah - United Arab Emirates	15	228.66	executive	pending	2026-01-05 14:18:18.031171	\N	\N	\N	cash	\N	2026-01-05 14:18:18.031171	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 7 (Seat: 2, Booster: 2, Infant: 3) | Pickup: 2026-01-05 @ 19:07 | Child Seats: 7	\N	\N	\N	\N	\N	\N	\N	\N
06df41f2-23a5-46c8-a362-a479bf59f2c7	dev test	+971354854874	Dubai - United Arab Emirates	Fujairah - United Arab Emirates	15	163.32	first_class	pending	2026-01-05 15:06:11.606991	\N	\N	\N	cash	\N	2026-01-05 15:06:11.606991	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 19:07 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
0d4f26e9-fd8f-466f-bc9c-b4ebdded032d	test two	+971354854874	Sharjah - United Arab Emirates	Sharjah - Al Ruqa Al Hamra - Sharjah - United Arab Emirates	15	201.44	urban_suv	pending	2026-01-05 15:23:48.772018	\N	\N	\N	cash	\N	2026-01-05 15:23:48.772018	5	4	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 20:22 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
9c0f77a0-a900-4a0d-8df9-333eca7e26c9	jawad nazari	+971354854874	Dubai - United Arab Emirates	Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates	15	99	luxury_suv	pending	2026-01-05 15:34:27.845099	\N	\N	\N	cash	\N	2026-01-05 15:34:27.845099	5	4	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 0 (Seat: 0, Booster: 0, Infant: 0) | Pickup: 2026-01-05 @ 20:33 | WhatsApp: +971	\N	\N	\N	\N	\N	\N	\N	\N
17bf40f2-f046-4c3e-88eb-d1c5fbd92380	test	+971354854874	Sharjah - United Arab Emirates	Dubai - United Arab Emirates	15	201.44	elite_van	pending	2026-01-05 16:09:30.951584	\N	\N	\N	cash	\N	2026-01-05 16:09:30.951584	7	7	round_trip	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 20:59 | Return: 2026-01-07 @ 11:10 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
7c02665b-5cf6-454d-bd9d-dc04ce1c0830	jawad nazari	+971354854874	Sharjah - United Arab Emirates	Dubai - United Arab Emirates	15	201.44	classic	pending	2026-01-05 16:14:06.140679	\N	\N	\N	cash	\N	2026-01-05 16:14:06.140679	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 21:12 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
38df5e85-6500-4cf3-9b2f-e683abf39e41	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	32.93	201.44	classic	pending	2026-01-05 16:47:48.777171	\N	\N	\N	cash	\N	2026-01-05 16:47:48.777171	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 21:44 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
4a66f032-55e9-4e0c-9cd2-d6738a22f077	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	32.93	201.44	classic	pending	2026-01-05 16:47:58.250574	\N	\N	\N	cash	\N	2026-01-05 16:47:58.250574	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 21:44 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
607c20ae-8940-4ccf-8542-fbf05b0c8b98	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	32.93	201.44	classic	pending	2026-01-05 16:48:05.420152	\N	\N	\N	cash	\N	2026-01-05 16:48:05.420152	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 21:44 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
d7890d25-8569-44ac-9c6e-e536d6629a43	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	32.93	201.44	classic	pending	2026-01-05 16:55:01.051829	\N	\N	\N	cash	\N	2026-01-05 16:55:01.051829	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 21:44 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
72aa8f92-eb92-4bdb-9a49-39426729e6de	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	32.93	201.44	classic	pending	2026-01-05 16:59:47.707051	\N	\N	\N	cash	\N	2026-01-05 16:59:47.707051	3	2	point_to_point	\N	\N	test@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 21:44 | Child Seats: 6	\N	\N	\N	\N	\N	\N	\N	\N
c08b33e3-c32a-4f1a-abe1-1ddc1da262a2	nadir	+9710559033884	Dubai - United Arab Emirates	Al Khail Rd - Hadaeq Sheikh Mohammed Bin Rashid - Dubai - United Arab Emirates	19.98	174.22	classic	pending	2026-01-05 17:02:13.183071	\N	\N	\N	cash	\N	2026-01-05 17:02:13.183071	3	2	point_to_point	\N	\N	Nabiakhan@gmail.com	wordpress	\N	\N	Child Seats: 5 (Seat: 1, Booster: 2, Infant: 2) | Pickup: 2026-01-05 @ 22:00 | Child Seats: 5	\N	\N	\N	\N	\N	\N	\N	\N
9b22a6ad-c7ab-460e-b6f4-4c4dc0350e30	nadir	+971354854874	Sharjah - Al Ruqa Al Hamra - Sharjah - United Arab Emirates	Sharjah - United Arab Emirates	8.17	119.78	executive	pending	2026-01-05 17:07:52.226628	\N	\N	\N	cash	\N	2026-01-05 17:07:52.226628	3	2	point_to_point	\N	\N	Nabia@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-05 @ 22:06 | Child Seats: 3	\N	\N	\N	2026-01-05 22:06:00	\N	\N	\N	\N
3c76885a-3806-49f2-bf72-e638aba1addc	Anas	+97107932664441	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	29.51	163.32	classic	assigned	2026-01-06 12:29:41.223736	d8df2cb8-cbf7-408d-a6ec-09819c0ee903	\N	\N	cash	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	2026-01-06 12:29:41.223736	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	Toyota Camry	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-06 @ 17:28 | Child Seats: 6	Black	\N	\N	2026-01-06 17:28:00	\N	\N	\N	\N
5ee83048-e30c-4330-ba69-889cf9e664c0	Omer	+97107932664441	Fujairah - United Arab Emirates	Dubai - United Arab Emirates	120.55	163.32	classic	assigned	2026-01-06 12:33:36.879957	0f1d5c26-2da3-45f9-9682-6fa3969fac1f	\N	\N	cash	eb1175b3-0ab7-4134-a870-58c0397a139f	2026-01-06 12:33:36.879957	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	Honda Civic	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-06 @ 17:32 | Child Seats: 6	Black	\N	\N	2026-01-06 17:32:00	\N	\N	\N	\N
8cc3e851-2467-4565-8ba4-b83649a46732	test	+971354854874	Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates	Al Khail Rd - Hadaeq Sheikh Mohammed Bin Rashid - Dubai - United Arab Emirates	15.96	108.88	executive	pending	2026-01-06 12:50:56.658199	\N	\N	\N	cash	\N	2026-01-06 12:50:56.658199	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 4 (Seat: 2, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 17:45 | Child Seats: 4 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 17:45:00	\N	\N	\N	\N
01f358cc-b24f-41c5-adb4-6c7c6c93e22d	test	+971354854874	Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates	Al Khail Rd - Hadaeq Sheikh Mohammed Bin Rashid - Dubai - United Arab Emirates	15.96	108.88	executive	pending	2026-01-06 13:03:07.849616	\N	\N	\N	cash	\N	2026-01-06 13:03:07.849616	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 4 (Seat: 2, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 17:45 | Child Seats: 4 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 17:45:00	\N	\N	\N	\N
49997793-391d-4416-a3e3-59abaa418156	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - Al Ruqa Al Hamra - Sharjah - United Arab Emirates	39.98	81.66	executive	pending	2026-01-06 13:04:00.140691	\N	\N	\N	cash	\N	2026-01-06 13:04:00.140691	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 18:03 | Child Seats: 3 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 18:03:00	\N	\N	\N	\N
d7156729-0640-4084-a6a3-6cbd6d6dc0bf	jawad nazari	+971354854874	Sharjah - United Arab Emirates	Saadiyat Island - Al Saadiyat Island - Abu Dhabi - United Arab Emirates	168.74	54.44	urban_suv	assigned	2026-01-06 13:17:42.332656	49cddb0a-9095-4d94-b501-e1fc0bbb72ca	\N	\N	cash	\N	2026-01-06 13:17:42.332656	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	BYD Song	Child Seats: 2 (Seat: 1, Booster: 1, Infant: 0) | Pickup: 2026-01-06 @ 18:16 | Child Seats: 2 | WhatsApp: +9710559033884	White	\N	\N	2026-01-06 18:16:00	\N	\N	\N	\N
5e0a2a84-86f7-4e6c-810c-16f30e85765f	jawad nazari	+971354854874	Sharjah - United Arab Emirates	Saadiyat Island - Al Saadiyat Island - Abu Dhabi - United Arab Emirates	168.74	54.44	urban_suv	assigned	2026-01-06 13:30:59.43932	1a77dc40-f880-45e2-88f1-d2c793ab63ff	\N	\N	cash	\N	2026-01-06 13:30:59.43932	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	GMC	Child Seats: 2 (Seat: 1, Booster: 1, Infant: 0) | Pickup: 2026-01-06 @ 18:16 | Child Seats: 2 | WhatsApp: +9710559033884	White	\N	\N	2026-01-06 18:16:00	\N	\N	\N	\N
26885b53-49b2-4ac0-9c49-8ceff0171976	jawad nazari	+971354854874	Sharjah - Al Ruqa Al Hamra - Sharjah - United Arab Emirates	Sharjah - United Arab Emirates	10.71	81.66	executive	pending	2026-01-06 13:40:51.219392	\N	\N	\N	cash	\N	2026-01-06 13:40:51.219392	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 18:40 | Child Seats: 3 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 18:40:00	\N	\N	\N	\N
0642c5ab-af89-4dd2-8f76-4eaedc3b9d9d	jawad nazari	+971354854874	Sharjah - Al Ruqa Al Hamra - Sharjah - United Arab Emirates	Sharjah - United Arab Emirates	10.71	81.66	executive	pending	2026-01-06 13:46:01.917933	\N	\N	\N	cash	\N	2026-01-06 13:46:01.917933	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 18:40 | Child Seats: 3 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 18:40:00	\N	\N	\N	\N
f69e564c-d1da-404d-a6fe-d975b40684b5	jawad nazari	+971354854874	Sharjah - United Arab Emirates	Al Nahda St - Hay Al Nahda - Al Nahda - Sharjah - United Arab Emirates	11.54	81.66	urban_suv	assigned	2026-01-06 13:46:45.516844	113a84a1-b8f0-49fd-b70d-1012c3a04e18	\N	\N	cash	\N	2026-01-06 13:46:45.516844	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	BYD Song	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 18:46 | Child Seats: 3 | WhatsApp: +9710559033884	White	\N	\N	2026-01-06 18:46:00	\N	\N	\N	\N
a137e1b9-2a72-4c0a-aa36-8dcf6ae5ee5b	jawad nazari	+971354854874	Sharjah - United Arab Emirates	Al Nahda St - Hay Al Nahda - Al Nahda - Sharjah - United Arab Emirates	11.54	81.66	urban_suv	pending	2026-01-06 13:47:46.868753	\N	\N	\N	cash	\N	2026-01-06 13:47:46.868753	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 18:46 | Child Seats: 3 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 18:46:00	\N	\N	\N	\N
976758ee-f201-435c-af78-24ca01b9ba34	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - Al Ruqa Al Hamra - Sharjah - United Arab Emirates	37.92	54.44	urban_suv	pending	2026-01-06 13:48:21.294434	\N	\N	\N	cash	\N	2026-01-06 13:48:21.294434	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 2 (Seat: 1, Booster: 1, Infant: 0) | Pickup: 2026-01-06 @ 18:47 | Child Seats: 2 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 18:47:00	\N	\N	\N	\N
d35583a5-0bfb-4809-ba37-eb3d8d1b3028	jawad nazari	+971354854874	Sharjah - United Arab Emirates	Sharjah - United Arab Emirates	15	81.66	urban_suv	pending	2026-01-06 14:05:12.691407	\N	\N	\N	cash	\N	2026-01-06 14:05:12.691407	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 19:04 | Child Seats: 3 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 19:04:00	\N	\N	\N	\N
67ebe3f1-c9cb-42df-86fd-f4ca28b61db9	Usman ALI	+9710559033884	Sharjah - United Arab Emirates	Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates	28.96	81.66	urban_suv	pending	2026-01-06 14:18:44.416721	\N	\N	\N	cash	\N	2026-01-06 14:18:44.416721	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 19:18 | Child Seats: 3	\N	\N	\N	2026-01-06 19:18:00	\N	\N	\N	\N
5fbc5d29-a73f-45ca-a713-be23de4cfb02	jawad nazari	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	28.86	163.32	classic	assigned	2026-01-06 14:27:10.608554	bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	\N	\N	cash	eff7f1c9-476d-4be1-b65d-572f9be22464	2026-01-06 14:27:10.608554	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	Toyota Camry	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-06 @ 19:26 | Child Seats: 6 | WhatsApp: +9710559033884	Black	\N	\N	2026-01-06 19:26:00	\N	\N	\N	\N
acbb1233-3f93-4441-9b1a-00b511f42e77	jawad nazari	+971354854874	Ras Al-Khaimah - Ras Al Khaimah - United Arab Emirates	Marsa Dubai - Jumeirah Beach Residence - Dubai - United Arab Emirates	155.07	201.44	executive	pending	2026-01-06 14:30:55.160818	\N	\N	\N	cash	\N	2026-01-06 14:30:55.160818	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 6 (Seat: 2, Booster: 2, Infant: 2) | Pickup: 2026-01-06 @ 19:30 | Child Seats: 6 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 19:30:00	\N	\N	\N	\N
8122779e-5ad5-486c-a463-15f47e036036	Ali	+971354854874	Sharjah - United Arab Emirates	Dubai - United Arab Emirates	28.65	108.88	classic	assigned	2026-01-06 14:42:21.886367	da82e6c3-bacc-404a-b7e5-7095e832adfa	\N	\N	cash	bbbb251b-e07d-4434-8c29-9461292d9c51	2026-01-06 14:42:21.886367	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	Toyota Corolla	Child Seats: 4 (Seat: 2, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 19:41 | Child Seats: 4 | WhatsApp: +9710559033884	Black	\N	\N	2026-01-06 19:41:00	\N	\N	\N	\N
9011a21f-b9e2-4250-9a69-74cdb4cc532c	Ahmed	+971354854874	Mena Jabal Ali - Dubai - United Arab Emirates	Al Qouz Ind.fourth - Al Quoz - Dubai - United Arab Emirates	36.41	136.1	executive	pending	2026-01-06 14:51:09.481847	\N	\N	\N	cash	\N	2026-01-06 14:51:09.481847	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 5 (Seat: 2, Booster: 1, Infant: 2) | Pickup: 2026-01-06 @ 19:50 | Child Seats: 5 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-06 19:50:00	\N	\N	\N	\N
3ee0f517-c962-4709-b4a1-1fe1a7e6bb4c	Usman 	+9710559033884	27 28th St - Al QusaisAl Qusais 3 - الطوار الرابعة - دبي - United Arab Emirates	Sharjah - United Arab Emirates	17.82	81.66	urban_suv	pending	2026-01-06 14:52:52.182283	\N	\N	\N	cash	\N	2026-01-06 14:52:52.182283	5	4	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-06 @ 19:52 | Child Seats: 3	\N	\N	\N	2026-01-06 19:52:00	\N	\N	\N	\N
47ed6247-4557-4562-9692-74d2e4cca178	asad	+971354854874	Dubai - United Arab Emirates	Sharjah - United Arab Emirates	36.71	81.66	classic	pending	2026-01-07 11:44:35.28311	\N	\N	\N	cash	\N	2026-01-07 11:44:35.28311	3	2	point_to_point	\N	\N	jawaddigitalminds@gmail.com	wordpress	\N	\N	Child Seats: 3 (Seat: 1, Booster: 1, Infant: 1) | Pickup: 2026-01-07 @ 16:42 | Child Seats: 3 | WhatsApp: +9710559033884	\N	\N	\N	2026-01-07 16:42:00	\N	\N	\N	\N
\.


--
-- Data for Name: car_images; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.car_images (id, vehicle_id, image_filename, image_size, image_type, uploaded_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, name, phone, email, whatsapp, preferred_vehicle, notes, created_at, updated_at) FROM stdin;
37	John Smith	+971506001111	john@example.com	+971506001111	sedan	\N	2025-11-26 18:09:39.649054	2025-11-26 18:09:39.649054
38	Fatima Al Mansoori	+971506001112	fatima@example.com	+971506001112	sedan	\N	2025-11-26 18:09:39.884013	2025-11-26 18:09:39.884013
39	Ahmed Al Mazrouei	+971506001113	ahmed@example.com	+971506001113	sedan	\N	2025-11-26 18:09:40.114067	2025-11-26 18:09:40.114067
40	Ali Raza	+971561000001	aliraza@test.com	+971561000001	sedan	\N	2025-11-26 18:17:48.462118	2025-11-26 18:17:48.462118
41	Fatima Khan	+971561000002	fatimakhan@test.com	+971561000002	sedan	\N	2025-11-26 18:17:48.69931	2025-11-26 18:17:48.69931
42	Hamza Sheikh	+971561000003	hamzasheikh@test.com	+971561000003	sedan	\N	2025-11-26 18:17:48.929092	2025-11-26 18:17:48.929092
43	Ayesha Malik	+971561000004	ayeshamalik@test.com	+971561000004	sedan	\N	2025-11-26 18:17:49.158412	2025-11-26 18:17:49.158412
44	Usman Tariq	+971561000005	usmantariq@test.com	+971561000005	sedan	\N	2025-11-26 18:17:49.387801	2025-11-26 18:17:49.387801
45	Zara Ali	+971561000006	zaraali@test.com	+971561000006	sedan	\N	2025-11-26 18:17:49.617074	2025-11-26 18:17:49.617074
46	Bilal Ahmed	+971561000007	bilalahmed@test.com	+971561000007	sedan	\N	2025-11-26 18:17:49.847376	2025-11-26 18:17:49.847376
47	Sana Noor	+971561000008	sananoor@test.com	+971561000008	sedan	\N	2025-11-26 18:17:50.076534	2025-11-26 18:17:50.076534
48	Hassan Rauf	+971561000009	hassanrauf@test.com	+971561000009	sedan	\N	2025-11-26 18:17:50.305902	2025-11-26 18:17:50.305902
49	Rabia Iqbal	+971561000010	rabiaiqbal@test.com	+971561000010	sedan	\N	2025-11-26 18:17:50.534954	2025-11-26 18:17:50.534954
50	Danish Mehmood	+971561000011	danishmehmood@test.com	+971561000011	sedan	\N	2025-11-26 18:17:50.764356	2025-11-26 18:17:50.764356
51	Hira Salman	+971561000012	hirasalman@test.com	+971561000012	sedan	\N	2025-11-26 18:17:50.994226	2025-11-26 18:17:50.994226
\.


--
-- Data for Name: driver_ratings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.driver_ratings (id, booking_id, driver_rating, trip_rating, customer_feedback, created_at) FROM stdin;
5873e841-6cc5-4935-8faa-048c4db95d21	d50678e2-9ec5-4d4c-9784-fbb2d58c1b46	5	5	Good experience, arrived on time.	2025-11-26 20:51:38.140298
191fea91-4a71-45c9-969d-4fbc8bcfb6e1	7eff05d6-fc15-4f6b-b49a-aae31e58cfea	5	4	Excellent service! Driver was very professional.	2025-11-26 20:51:38.140298
a5da75e3-b8e5-439d-bc99-e58d39e042f3	ec35b942-1876-4326-b2f8-1ca8b9a88a28	3	5	Good experience, arrived on time.	2025-11-26 20:51:38.140298
bb1aad5d-29fd-439a-9e17-e50a5f7639b0	dbfb93d3-fa61-4bb7-9cdf-2154bcf1e9ed	3	4	Good experience, arrived on time.	2025-11-26 20:51:38.140298
9f1c7e49-d5d1-409b-a9af-7f25c4d6d623	2b801f3e-bdab-4ba9-abb5-9344d3478498	5	4	Good experience, arrived on time.	2025-11-26 20:51:38.140298
d46b0f4a-9840-458e-907b-c700293cb3b2	dc58be4f-8487-456c-bf23-1103353c51af	3	5	Good experience, arrived on time.	2025-11-26 20:51:38.140298
288af928-1e85-4733-b32a-a4a542c60724	d38539ba-b8d0-4b34-9f6f-3269887bafc2	3	3	Decent trip, clean vehicle.	2025-11-26 20:51:38.140298
14803b0a-662c-4182-8870-2680b1b47107	75c0cc45-0664-4ecc-b1f3-ba7acda45d91	5	3	Good experience, arrived on time.	2025-11-26 20:51:38.140298
47915ba8-efa9-4be4-a484-632300a35f86	32aa7ea7-a2cd-4a56-b13a-ca723035838f	5	5	Good experience, arrived on time.	2025-11-26 20:51:38.140298
b409be5e-7a68-4276-8ebd-c21ab86e9f00	ac3ce546-84bf-4565-a111-d93d394e72d1	5	3	Excellent service! Driver was very professional.	2025-11-26 20:51:38.140298
047439f6-ef56-4f4c-9c98-a90580ba047a	067bfa20-ab99-47bb-b2ec-1404cca2e522	5	4	Excellent service! Driver was very professional.	2025-11-26 20:51:38.140298
950c6391-12a5-4980-b3a1-684a1e8e7182	7ceb0c26-24ea-4713-a6ae-d03834dcf9f7	4	4	Decent trip, clean vehicle.	2025-11-26 20:51:38.140298
a12f40d1-c4de-4fb4-858f-8a10bd3b3d0a	af653f1a-9a98-4cec-840e-ce4d17bc5dfb	5	4	Good experience, arrived on time.	2025-11-26 20:51:38.140298
9459ff9c-470c-42ce-bec3-26bec57e377d	460d70b2-3e7c-4774-a63c-cef65da3880f	4	3	Excellent service! Driver was very professional.	2025-11-26 20:51:38.140298
b4922bab-359d-480e-beff-481f23c19aea	202f6f40-7ef5-4872-96f4-f3d5566b88d0	5	5	Good experience, arrived on time.	2025-11-26 20:51:38.140298
f4fde58c-cea6-41ad-a81d-9d8a0432209b	2d3a483f-3bb8-48f2-9fe7-6fca93b83486	3	3	Decent trip, clean vehicle.	2025-11-26 20:51:38.140298
47321582-5624-447d-9d9c-d7ac54c97f7b	7dcfd154-9724-4100-9617-220f94cdeba5	3	4	Good experience, arrived on time.	2025-11-26 20:51:38.140298
9844c64b-721d-4b54-89bb-b2cfe7b83435	8c3c19d2-71d3-4ce5-94bc-e2126056d0cb	3	5	Excellent service! Driver was very professional.	2025-11-26 20:51:38.140298
a3504c20-3440-43e1-80b1-df116c27e434	5d1076e0-99d8-48ce-acb9-51e4b2be0712	3	3	Good experience, arrived on time.	2025-11-26 20:51:38.140298
109b8aca-8fa0-435e-b347-a54dbdb4f690	702e5f1d-bd55-45dd-af17-78946d9ecbfa	3	3	Good experience, arrived on time.	2025-11-26 20:51:38.140298
2c6dbf95-3cc0-4c90-aca7-8800f55efad1	55e0f625-2449-4859-9a33-ba9129a20009	4	3	Good experience, arrived on time.	2025-11-26 20:51:38.140298
2caa0d1b-b5f2-441d-aef3-fa64d99dc5e2	4a0e24df-ef86-4026-92cc-8c16b3c0c1c3	4	5	Good experience, arrived on time.	2025-11-26 20:51:38.140298
50c9b901-6e9c-4838-bc77-3fbae7d3c0df	33156ece-a65e-47a8-9d1e-be6212f40f58	3	4	Good experience, arrived on time.	2025-11-26 20:51:38.140298
e2ebd202-7442-4909-8cf9-1154ba820be0	c6f44826-7521-4c5d-8536-af2f1ef0e293	3	4	Good experience, arrived on time.	2025-11-26 20:51:38.140298
437f6b02-9e15-4e7c-8dc0-425f7bf8dc12	2bb44fe8-f333-4e83-8dc2-f7326a7770ca	5	3	Excellent service! Driver was very professional.	2025-11-26 20:51:38.140298
ff95fd82-0966-44cf-9bb9-b7e6e36fb009	c4b14dfd-2e8d-407a-9751-cceb5c2750ec	5	5	Good experience, arrived on time.	2025-11-26 20:51:38.140298
dadb7d14-a1f9-4f3d-a014-ae2dbc62fcf2	bdae2393-e7bc-4cc2-a9bd-2b9b2b8dc27a	4	3	Excellent service! Driver was very professional.	2025-11-26 20:51:38.140298
31ceef30-cb93-4afe-8003-ed9ce7092a8f	3bfb8d4f-a3d2-4c3e-82fc-efa7b9e3ad37	5	4	Good experience, arrived on time.	2025-11-26 20:51:38.140298
c943f59d-e435-4b26-be40-d6ff28fb5c68	f862d633-6931-4ab4-b8de-739a4458354b	3	4	Excellent service! Driver was very professional.	2025-11-26 20:51:38.140298
d2b2f905-584f-4e9e-90d2-9a94d27693f4	ba3c1a92-1b9c-43c0-a042-baf88232da65	4	5	Decent trip, clean vehicle.	2025-11-26 20:51:38.140298
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.drivers (id, vendor_id, name, phone, license_number, created_at, status, updated_at, auto_assign, license_issue_date, license_expiry_date, image_url, email, password_hash, bank_account_number, bank_name, account_holder_name, driver_registration_status, national_id, date_of_birth, updated_by) FROM stdin;
bbbb251b-e07d-4434-8c29-9461292d9c51	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Ahmed Hassan	+971503333333	AE000012	2025-11-26 18:09:34.121589	offline	2025-11-30 01:15:10.212667	t	2024-11-26	2029-11-26	https://ui-avatars.com/api/?name=Ahmed+Hassan&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	\N	Test Driver	+971501234567	\N	2025-11-30 22:08:38.038772	offline	2025-11-30 22:08:38.038772	t	\N	\N	\N	driver@example.com	$2b$10$49EFlTx03jiCiQvVLQwwnumsrF3Im41hfLX7/haC91FunqCKhYGIy	\N	\N	\N	approved	\N	\N	\N
0e0e05e7-df4c-4a3a-8f8c-09c6d5d2b712	\N	Jawad	03072189005	0212545	2026-01-07 12:23:00.570422	offline	2026-01-07 12:23:00.570422	t	\N	\N	\N	jawaddigitalminds@gmail.com	$2b$10$d7Ms9m54vQbSmZ.2vz6rsOdkinK7Kky8od8CkeKm.4SwzigVsUozW	030702189005	easypaisa	Jawad	pending	pakistani	1990-11-15	\N
e9785cd4-837f-4cfa-a535-8a6b3022eea1	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Zainab Mohamed	+971507777778	AE000014	2025-11-26 18:09:37.347556	online	2026-01-08 12:25:04.232535	t	2023-11-26	2028-11-26	https://ui-avatars.com/api/?name=Zainab+Mohamed&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
26bcd573-1af6-4698-8990-8e95a063635a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Ibrahim Khan	+971509999999	AE000004	2025-11-26 18:09:35.506906	Approved	2026-01-08 10:23:45.86967	t	2024-11-26	2029-11-26	https://ui-avatars.com/api/?name=Ibrahim+Khan&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
417ea360-3044-476e-a769-5a2130d96d7a	\N	jawad nazari	+92354854874	0212545	2026-01-07 13:49:22.630659	Approved	2026-01-08 12:07:12.780999	t	\N	\N	\N	jawaddigitalminds@gmail.com	$2b$10$RmCTkgwG1jYAzLGZEd7l7ORy5TyHTZJfhPbx/bNLGWwq5BVhykwBC	030702189005	easypaisa	jawad nazari	pending	pakistani	1990-06-22	\N
06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Hassan Mahmoud	+971507777777	AE000001	2025-11-26 18:09:35.046005	offline	2025-11-26 18:09:35.046005	t	2022-11-26	2027-11-26	https://ui-avatars.com/api/?name=Hassan+Mahmoud&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
0aceffab-516f-43dc-8cc4-48bae23dec69	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Noor Ibrahim	+971503333334	AE000002	2025-11-26 18:09:36.427995	offline	2025-11-26 18:09:36.427995	t	2023-11-26	2028-11-26	https://ui-avatars.com/api/?name=Noor+Ibrahim&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
21e2dd72-821f-4126-b480-091e8a7d04d4	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Khalid Mansour	+971502222223	AE000003	2025-11-26 18:09:36.198412	online	2025-11-26 18:09:36.198412	t	2021-11-26	2026-11-26	https://ui-avatars.com/api/?name=Khalid+Mansour&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
32b6548e-dd3a-4e12-b045-759671263394	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Karim Hassan	+971508888889	AE000005	2025-11-26 18:09:37.57711	offline	2025-11-26 18:09:37.57711	f	2020-11-26	2025-05-26	https://ui-avatars.com/api/?name=Karim+Hassan&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
7983e2e1-14b7-49bd-a15f-988038a17e51	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Rashid Al Mansoori	+971508888888	AE000006	2025-11-26 18:09:35.27716	online	2025-11-26 18:09:35.27716	t	2023-11-26	2028-11-26	https://ui-avatars.com/api/?name=Rashid+Al+Mansoori&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
7dc4b95a-83e1-4abf-aa5a-88f2e463f1f3	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Aisha Abdullah	+971506666667	AE000007	2025-11-26 18:09:37.11714	online	2025-11-26 18:09:37.11714	t	2022-11-26	2027-11-26	https://ui-avatars.com/api/?name=Aisha+Abdullah&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
9f547d39-af55-4b02-86d2-3b5a5b70c8fb	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Fatima Khan	+971505555555	AE000008	2025-11-26 18:09:34.584164	offline	2025-11-26 18:09:34.584164	t	2024-11-26	2029-11-26	https://ui-avatars.com/api/?name=Fatima+Khan&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
b5d713bb-17d8-4c02-ba03-5beb243c79e8	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Ali Hussain	+971506666666	AE000009	2025-11-26 18:09:34.815613	online	2025-11-26 18:09:34.815613	t	2021-11-26	2026-11-26	https://ui-avatars.com/api/?name=Ali+Hussain&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
ba981095-24ed-4cdb-9f6a-b450e5fe9e99	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Omar Al Mazrouei	+971505555556	AE000010	2025-11-26 18:09:36.887477	offline	2025-11-26 18:09:36.887477	t	2023-11-26	2028-11-26	https://ui-avatars.com/api/?name=Omar+Al+Mazrouei&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
bb37d0b3-5956-4644-85f1-d9fc441cc7a4	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Hassan Ibrahim	+971504444445	AE000011	2025-11-26 18:09:36.657884	online	2025-11-26 18:09:36.657884	f	2020-11-26	2024-11-26	https://ui-avatars.com/api/?name=Hassan+Ibrahim&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
dd639c64-7587-4d69-a4ca-86dfafb00e5c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Sara Ahmed	+971501111112	AE000013	2025-11-26 18:09:35.966781	online	2025-11-26 18:09:35.966781	t	2022-11-26	2027-11-26	https://ui-avatars.com/api/?name=Sara+Ahmed&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
eb1175b3-0ab7-4134-a870-58c0397a139f	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Marwan Ali	+971500000000	AE000015	2025-11-26 18:09:35.736809	online	2025-11-26 18:09:35.736809	t	2021-11-26	2026-11-26	https://ui-avatars.com/api/?name=Marwan+Ali&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
eff7f1c9-476d-4be1-b65d-572f9be22464	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Mohammed Ali	+971504444444	AE000016	2025-11-26 18:09:34.354341	online	2025-11-26 18:09:34.354341	t	2024-11-26	2029-11-26	https://ui-avatars.com/api/?name=Mohammed+Ali&background=random&size=128&bold=true&font-size=0.4	\N	\N	\N	\N	\N	pending	\N	\N	\N
\.


--
-- Data for Name: fare_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.fare_rules (id, vehicle_type, base_fare, per_km_rate, active, created_at, updated_at, updated_by, included_km) FROM stdin;
34dc3d54-e530-42ba-95e7-b3179656ac67	executive	105.00	1.00	t	2025-11-28 17:34:01.027766	2025-11-28 17:34:01.027766	\N	20
55a8ec91-4cf7-41e1-866f-58cc0322590f	urban_suv	108.00	1.00	t	2025-11-28 17:34:01.027766	2025-11-28 17:34:01.027766	\N	20
4a45c49f-1a80-43fe-979e-0581ec1b4bf5	luxury_suv	170.00	1.80	t	2025-11-28 17:34:01.027766	2025-11-28 17:34:01.027766	\N	20
d5398b9b-fd5f-4cc3-b83e-02493c48fb96	elite_van	165.00	2.00	t	2025-11-28 17:34:01.027766	2025-11-28 17:34:01.027766	\N	20
86c301e9-21ac-46fa-a220-64bd0420123d	mini_bus	825.00	7.50	t	2025-11-28 17:34:01.027766	2025-11-28 17:34:01.027766	\N	50
95c0e67a-d89e-4f09-bf15-d739e5ce6624	first_class	450.00	1.75	t	2025-11-30 02:10:06.563368	2025-11-30 02:10:06.563368	\N	40
6120a8d1-a875-49cf-97bf-58bd27412e7e	luxury	450.00	1.75	t	2025-11-30 02:10:06.563368	2025-11-30 02:10:06.563368	\N	40
e2644fc4-499e-416f-9da7-e6a3290ce831	classic	95.00	1.00	t	2025-11-28 17:34:01.027766	2026-01-07 07:04:05.572743	\N	20
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notification_logs (id, recipient_type, recipient_phone, recipient_email, channel, template_id, content, status, metadata, created_at) FROM stdin;
1	customer	+16186880438	\N	whatsapp	booking_confirmation	🚖 Booking Confirmed!\nBooking ID: #82ab6988-fef7-4b75-837e-ad25e45c5cdb\nPickup: Dubai Marina Mall\nDropoff: Dubai International Airport Terminal 3\nFare: AED 40\nDriver: Ahmed Hassan\nDriver Phone: +971503333333\n\nTrack your ride: [Link coming soon]	sent	{"booking_id": "82ab6988-fef7-4b75-837e-ad25e45c5cdb"}	2025-11-26 18:29:03.013411
2	customer	\N		email	booking_confirmation_email	Dear All right.,\n\nYour booking has been confirmed!\n\nBooking Details:\n- Booking ID: #82ab6988-fef7-4b75-837e-ad25e45c5cdb\n- Pickup: Dubai Marina Mall\n- Dropoff: Dubai International Airport Terminal 3\n- Distance: 10 km\n- Vehicle: SEDAN\n- Total Fare: AED 40\n- Driver: Ahmed Hassan\n- Driver Phone: +971503333333\n\nYour ride is on its way!\n\nBest regards,\nBareerah Limo Service	sent	{"booking_id": "82ab6988-fef7-4b75-837e-ad25e45c5cdb"}	2025-11-26 18:29:03.261502
3	driver	+971503333333	\N	whatsapp	booking_assigned	🎯 New Booking Assigned!\nBooking ID: #82ab6988-fef7-4b75-837e-ad25e45c5cdb\nCustomer: All right.\nCustomer Phone: +16186880438\nPickup: Dubai Marina Mall\nDropoff: Dubai International Airport Terminal 3\nDistance: 10 km\nEstimated Fare: AED 40\nCar: SEDAN	sent	{"booking_id": "82ab6988-fef7-4b75-837e-ad25e45c5cdb"}	2025-11-26 18:29:03.503644
4	driver	\N		email	booking_assigned_email	Dear Ahmed Hassan,\n\nYou have been assigned a new booking!\n\nBooking Details:\n- Booking ID: #82ab6988-fef7-4b75-837e-ad25e45c5cdb\n- Customer: All right.\n- Customer Phone: +16186880438\n- Pickup: Dubai Marina Mall\n- Dropoff: Dubai International Airport Terminal 3\n- Distance: 10 km\n- Estimated Fare: AED 40\n\nPlease confirm your acceptance in the driver app.\n\nBest regards,\nBareerah Admin	sent	{"booking_id": "82ab6988-fef7-4b75-837e-ad25e45c5cdb"}	2025-11-26 18:29:03.746307
5	admin	\N	\N	whatsapp	booking_alert	📊 New Booking Alert!\nBooking ID: #82ab6988-fef7-4b75-837e-ad25e45c5cdb\nCustomer: All right.\nDriver: Ahmed Hassan\nVehicle: SEDAN\nFare: AED 40\nStatus: pending	sent	{"booking_id": "82ab6988-fef7-4b75-837e-ad25e45c5cdb"}	2025-11-26 18:29:03.989604
6	admin	\N	admin@bareerah.ae	email	booking_alert_email	New booking created in the system.\n\nBooking Details:\n- Booking ID: #82ab6988-fef7-4b75-837e-ad25e45c5cdb\n- Customer: All right. (+16186880438)\n- Driver: Ahmed Hassan\n- Vehicle: SEDAN\n- Pickup: Dubai Marina Mall\n- Dropoff: Dubai International Airport Terminal 3\n- Distance: 10 km\n- Fare: AED 40\n- Payment: undefined\n- Status: pending\n\nManage from dashboard: [Dashboard Link]	sent	{"booking_id": "82ab6988-fef7-4b75-837e-ad25e45c5cdb"}	2025-11-26 18:29:04.231532
7	customer	971501234567	\N	whatsapp	booking_confirmation	🚖 Booking Confirmed!\nBooking ID: #d229f59b-7341-44d7-abcb-c7f81df14271\nPickup: Dubai Airport\nDropoff: Burj Khalifa\nFare: AED undefined\nDriver: Ahmed Hassan\nDriver Phone: +971503333333\nVehicle: Mercedes Sprinter (N/A)\nPlate: N/A\n\nTrack your ride: [Link coming soon]	sent	{"booking_id": "d229f59b-7341-44d7-abcb-c7f81df14271"}	2025-11-30 04:52:05.128323
8	customer	\N	demo@test.ae	email	booking_confirmation_email	Dear Demo Customer,\n\nYour booking has been confirmed!\n\nBooking Details:\n- Booking ID: #d229f59b-7341-44d7-abcb-c7f81df14271\n- Pickup: Dubai Airport\n- Dropoff: Burj Khalifa\n- Distance: 15 km\n- Vehicle Type: MINI_BUS\n- Vehicle Model: Mercedes Sprinter\n- Vehicle Color: N/A\n- License Plate: N/A\n- Total Fare: AED undefined\n- Driver: Ahmed Hassan\n- Driver Phone: +971503333333\n\nYour ride is on its way!\n\nBest regards,\nBareerah Limo Service	sent	{"booking_id": "d229f59b-7341-44d7-abcb-c7f81df14271"}	2025-11-30 04:52:05.380999
9	driver	+971503333333	\N	whatsapp	booking_assigned	🎯 New Booking Assigned!\nBooking ID: #d229f59b-7341-44d7-abcb-c7f81df14271\nCustomer: Demo Customer\nCustomer Phone: 971501234567\nPickup: Dubai Airport\nDropoff: Burj Khalifa\nDistance: 15 km\nEstimated Fare: AED undefined\nCar: MINI_BUS	sent	{"booking_id": "d229f59b-7341-44d7-abcb-c7f81df14271"}	2025-11-30 04:52:05.629583
10	admin	\N	\N	whatsapp	booking_alert	📊 New Booking Alert!\nBooking ID: #d229f59b-7341-44d7-abcb-c7f81df14271\nCustomer: Demo Customer\nDriver: Ahmed Hassan\nVehicle: MINI_BUS\nFare: AED undefined\nStatus: pending	sent	{"booking_id": "d229f59b-7341-44d7-abcb-c7f81df14271"}	2025-11-30 04:52:05.879136
11	admin	\N	admin@bareerah.ae	email	booking_alert_email	New booking created in the system.\n\nBooking Details:\n- Booking ID: #d229f59b-7341-44d7-abcb-c7f81df14271\n- Customer: Demo Customer (971501234567)\n- Driver: Ahmed Hassan\n- Vehicle: MINI_BUS\n- Pickup: Dubai Airport\n- Dropoff: Burj Khalifa\n- Distance: 15 km\n- Fare: AED undefined\n- Payment: undefined\n- Status: pending\n\nManage from dashboard: [Dashboard Link]	sent	{"booking_id": "d229f59b-7341-44d7-abcb-c7f81df14271"}	2025-11-30 04:52:06.127514
12	customer	971551234567	\N	whatsapp	booking_confirmation	🚖 Booking Confirmed!\nBooking ID: #f28d756d-54fa-417f-9008-6529abddd5c7\nPickup: Dubai Mall\nDropoff: Emirates Towers\nFare: AED undefined\nDriver: Ahmed Hassan\nDriver Phone: +971503333333\nVehicle: Mercedes Sprinter (N/A)\nPlate: N/A\n\nTrack your ride: [Link coming soon]	sent	{"booking_id": "f28d756d-54fa-417f-9008-6529abddd5c7"}	2025-11-30 04:53:28.191227
13	customer	\N	sara@example.ae	email	booking_confirmation_email	Dear Sara Al-Mansouri,\n\nYour booking has been confirmed!\n\nBooking Details:\n- Booking ID: #f28d756d-54fa-417f-9008-6529abddd5c7\n- Pickup: Dubai Mall\n- Dropoff: Emirates Towers\n- Distance: 8 km\n- Vehicle Type: MINI_BUS\n- Vehicle Model: Mercedes Sprinter\n- Vehicle Color: N/A\n- License Plate: N/A\n- Total Fare: AED undefined\n- Driver: Ahmed Hassan\n- Driver Phone: +971503333333\n\nYour ride is on its way!\n\nBest regards,\nBareerah Limo Service	sent	{"booking_id": "f28d756d-54fa-417f-9008-6529abddd5c7"}	2025-11-30 04:53:28.431244
14	driver	+971503333333	\N	whatsapp	booking_assigned	🎯 New Booking Assigned!\nBooking ID: #f28d756d-54fa-417f-9008-6529abddd5c7\nCustomer: Sara Al-Mansouri\nCustomer Phone: 971551234567\nPickup: Dubai Mall\nDropoff: Emirates Towers\nDistance: 8 km\nEstimated Fare: AED undefined\nCar: MINI_BUS	sent	{"booking_id": "f28d756d-54fa-417f-9008-6529abddd5c7"}	2025-11-30 04:53:28.668302
15	admin	\N	\N	whatsapp	booking_alert	📊 New Booking Alert!\nBooking ID: #f28d756d-54fa-417f-9008-6529abddd5c7\nCustomer: Sara Al-Mansouri\nDriver: Ahmed Hassan\nVehicle: MINI_BUS\nFare: AED undefined\nStatus: pending	sent	{"booking_id": "f28d756d-54fa-417f-9008-6529abddd5c7"}	2025-11-30 04:53:28.904253
16	admin	\N	admin@bareerah.ae	email	booking_alert_email	New booking created in the system.\n\nBooking Details:\n- Booking ID: #f28d756d-54fa-417f-9008-6529abddd5c7\n- Customer: Sara Al-Mansouri (971551234567)\n- Driver: Ahmed Hassan\n- Vehicle: MINI_BUS\n- Pickup: Dubai Mall\n- Dropoff: Emirates Towers\n- Distance: 8 km\n- Fare: AED undefined\n- Payment: undefined\n- Status: pending\n\nManage from dashboard: [Dashboard Link]	sent	{"booking_id": "f28d756d-54fa-417f-9008-6529abddd5c7"}	2025-11-30 04:53:29.140468
17	customer	971501234567	\N	whatsapp	booking_confirmation	🚖 Booking Confirmed!\nBooking ID: #58b44da5-f8ee-4f3a-b4c4-9fea017df618\nPickup: Dubai Airport\nDropoff: Burj Khalifa\nFare: AED undefined\nDriver: Ahmed Hassan\nDriver Phone: +971503333333\nVehicle: Mercedes Sprinter (N/A)\nPlate: N/A\n\nTrack your ride: [Link coming soon]	sent	{"booking_id": "58b44da5-f8ee-4f3a-b4c4-9fea017df618"}	2025-11-30 04:53:41.778065
18	driver	+971503333333	\N	whatsapp	booking_assigned	🎯 New Booking Assigned!\nBooking ID: #58b44da5-f8ee-4f3a-b4c4-9fea017df618\nCustomer: Test Notes\nCustomer Phone: 971501234567\nPickup: Dubai Airport\nDropoff: Burj Khalifa\nDistance: 20 km\nEstimated Fare: AED undefined\nCar: MINI_BUS	sent	{"booking_id": "58b44da5-f8ee-4f3a-b4c4-9fea017df618"}	2025-11-30 04:53:42.01527
19	admin	\N	\N	whatsapp	booking_alert	📊 New Booking Alert!\nBooking ID: #58b44da5-f8ee-4f3a-b4c4-9fea017df618\nCustomer: Test Notes\nDriver: Ahmed Hassan\nVehicle: MINI_BUS\nFare: AED undefined\nStatus: pending	sent	{"booking_id": "58b44da5-f8ee-4f3a-b4c4-9fea017df618"}	2025-11-30 04:53:42.243977
20	admin	\N	admin@bareerah.ae	email	booking_alert_email	New booking created in the system.\n\nBooking Details:\n- Booking ID: #58b44da5-f8ee-4f3a-b4c4-9fea017df618\n- Customer: Test Notes (971501234567)\n- Driver: Ahmed Hassan\n- Vehicle: MINI_BUS\n- Pickup: Dubai Airport\n- Dropoff: Burj Khalifa\n- Distance: 20 km\n- Fare: AED undefined\n- Payment: undefined\n- Status: pending\n\nManage from dashboard: [Dashboard Link]	sent	{"booking_id": "58b44da5-f8ee-4f3a-b4c4-9fea017df618"}	2025-11-30 04:53:42.471223
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payouts (id, vendor_id, amount_aed, status, payment_date, notes, created_at) FROM stdin;
a31ea880-76ba-433a-9dde-be2567ffdf65	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	1492.00	completed	2025-11-19 21:07:04.799071	\N	2025-11-26 21:07:04.799071
6b3f3738-2437-4aaa-bce6-25b59082b84c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	5946.00	completed	2025-11-19 21:07:04.799071	\N	2025-11-26 21:07:04.799071
c0d54335-3fcc-46a2-94b5-079f802cbb71	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	500.00	completed	\N	\N	2025-11-27 22:36:26.041621
d0580c8b-d33f-4679-9ab5-64754655f221	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	450.00	completed	\N	\N	2025-11-24 22:36:26.041621
\.


--
-- Data for Name: rental_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.rental_rules (id, vehicle_type, hourly_rate_aed, min_hours, max_hours, is_active, created_at, updated_at) FROM stdin;
fdb9fb29-035b-49fa-9694-95d9c60d7644	classic	95.00	3	14	t	2025-11-30 19:11:41.112077	2025-11-30 19:11:41.112077
25087d14-bc25-4ec2-a605-e8ad366cf513	executive	105.00	3	14	t	2025-11-30 19:11:41.112077	2025-11-30 19:11:41.112077
1b2eefd1-a9e8-4c6d-85af-3a41d470e953	first_class	150.00	3	14	t	2025-11-30 19:11:41.112077	2025-11-30 19:11:41.112077
c4f678ef-4226-4cbf-a256-b25222524abc	urban_suv	108.00	3	14	t	2025-11-30 19:11:41.112077	2025-11-30 19:11:41.112077
24b8ec51-374c-4b4b-a6cd-5465d02a6db5	luxury_suv	450.00	3	14	t	2025-11-30 19:11:41.112077	2025-11-30 19:11:41.112077
032b2f61-b5fb-4d5d-8002-b6c1870917be	elite_van	165.00	3	14	t	2025-11-30 19:11:41.112077	2025-11-30 19:11:41.112077
1c9ed0a1-50e3-4cb6-a590-4b6387f9f94c	mini_bus	1050.00	3	14	t	2025-11-30 19:11:41.112077	2025-11-30 19:11:41.112077
1b21b0a7-f05f-4934-aea6-18ebeadf7110	luxury	250.00	3	14	t	2025-11-30 23:11:09.58405	2025-11-30 23:11:09.58405
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password_hash, role, name, phone, status, created_at, updated_at) FROM stdin;
1	admin@example.com	$2b$10$34v/YHsrnHTFfGrl7XGEneMS/GqJLHx1y22ANR026Rap.amLscFF6	admin	Admin User	+971501234567	active	2025-11-29 22:23:34.643729	2025-11-29 22:23:34.643729
3	vendor@test.com	$2b$10$KL2PWAZuGP4nlGjC/wQ3XOQb16/865z1ZXxjmLeEqLa74U1.TzRry	vendor	Vendor Demo	+971503456789	active	2025-11-29 22:23:34.643729	2025-11-29 22:23:34.643729
4	driver@example.com	$2b$10$8.XWIrNqPLHfUhXqJz7L0Oxzz7nqUJJLlE0rKHj9qLcKGJcWE5eWe	driver	Driver Demo	+971504567890	active	2025-11-29 22:23:34.643729	2025-11-29 22:23:34.643729
2	operator@example.com	$2b$10$ZEIl.j0ZE9A2rKAsOdLPlOi9LB4eeku9n54eFPNWn2HrN0EAtg7wG	operator	Operator User	+971502345678	active	2025-11-29 22:23:34.643729	2025-11-29 22:23:34.643729
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vehicles (id, vendor_id, driver_id, plate_number, model, type, created_at, status, max_passengers, max_luggage, has_big_trunk, hourly_price, per_km_price, active, color, image_url, updated_by) FROM stdin;
7da8aa3f-8701-48d7-81e9-6abba62dd860	67d97a9a-dfb4-411c-b3e5-a716235598c1	32b6548e-dd3a-4e12-b045-759671263394	DEMO105	Toyota Highlander	urban_suv	2025-11-30 03:15:54.421093	on_trip	5	4	t	50.00	1.50	t	Black	\N	\N
7270ab4d-b7f1-4da2-8107-4e7c8d3bf3f6	67d97a9a-dfb4-411c-b3e5-a716235598c1	0aceffab-516f-43dc-8cc4-48bae23dec69	DEMO102	Lexus ES 300H	executive	2025-11-30 03:15:54.421093	on_trip	5	4	t	50.00	1.50	t	Silver	\N	\N
d32e7b7e-7468-4b71-8fbe-627207d31156	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	LEXUS-ES-001	Lexus ES 300H	executive	2025-11-28 17:35:10.924991	on_trip	4	3	t	75.00	3.50	t	Silver	/images/vehicles/range_rover_lexus_lu_478425b3.jpg	\N
89ee1ed9-f0d0-4e0d-bd3a-7a76d712f0eb	67d97a9a-dfb4-411c-b3e5-a716235598c1	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	DEMO101	Toyota Hiace	classic	2025-11-30 03:15:54.421093	on_trip	5	4	t	50.00	1.50	t	Black	\N	\N
25e647ca-92a5-4c3b-bb54-9b4be85f7a37	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	0aceffab-516f-43dc-8cc4-48bae23dec69	TOYOTA-HL-001	Toyota Highlander	urban_suv	2025-11-28 17:35:10.924991	on_trip	7	4	t	75.00	3.50	t	Black	/images/vehicles/toyota_highlander_fo_3ccb53bd.jpg	\N
e5293bbf-8ca0-4ff5-8119-08a8ac35ba8f	67d97a9a-dfb4-411c-b3e5-a716235598c1	21e2dd72-821f-4126-b480-091e8a7d04d4	DEMO103	BMW 7 Series	first_class	2025-11-30 03:15:54.421093	on_trip	5	4	t	50.00	1.50	t	Black	\N	\N
a67cd6bf-cdf8-48a0-ad08-8a7d6ad0a20f	67d97a9a-dfb4-411c-b3e5-a716235598c1	bbbb251b-e07d-4434-8c29-9461292d9c51	DEMO100	Mercedes Sprinter	mini_bus	2025-11-30 03:15:54.421093	available	5	4	t	50.00	1.50	t	White	\N	\N
185801b2-aef3-4efa-ab6f-3cc9e5aa3ed2	67d97a9a-dfb4-411c-b3e5-a716235598c1	7983e2e1-14b7-49bd-a15f-988038a17e51	DEMO106	Mercedes V Class	elite_van	2025-11-30 03:15:54.421093	available	5	4	t	50.00	1.50	t	Black	\N	\N
ab209cb6-cba3-4f61-b265-380ca4085cb8	67d97a9a-dfb4-411c-b3e5-a716235598c1	\N	DEMO107	Range Rover	luxury	2025-11-30 03:15:54.421093	available	5	4	t	50.00	1.50	t	Silver	\N	\N
45563e13-c868-430d-beb3-e5b6d8121543	67d97a9a-dfb4-411c-b3e5-a716235598c1	\N	DEMO108	Audi A8	luxury	2025-11-30 03:15:54.421093	available	5	4	t	50.00	1.50	t	Blue	\N	\N
c3dfd059-1218-4c6e-aa35-d8bfa2fa5ff6	67d97a9a-dfb4-411c-b3e5-a716235598c1	\N	DEMO109	Cadillac Escalade	luxury_suv	2025-11-30 03:15:54.421093	available	5	4	t	50.00	1.50	t	Gray	\N	\N
e05e9f46-3245-4658-bebe-b478492db40d	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	bbbb251b-e07d-4434-8c29-9461292d9c51	BYD-HAN-001	BYD Han	classic	2025-11-28 17:35:10.924991	on_trip	4	2	t	75.00	3.50	t	White	/images/vehicles/toyota_hiace_microbu_505726df.jpg	\N
d8df2cb8-cbf7-408d-a6ec-09819c0ee903	\N	e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	DXB-001	Toyota Camry	classic	2025-11-30 22:36:20.723568	on_trip	4	3	t	75.00	3.50	t	Black	\N	\N
49cddb0a-9095-4d94-b501-e1fc0bbb72ca	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	BYD-SONG-001	BYD Song	urban_suv	2025-11-28 17:35:10.924991	on_trip	5	4	t	75.00	3.50	t	White	/images/vehicles/toyota_hiace_microbu_505726df.jpg	\N
31278e30-8220-4ce1-ab93-b739d0afe503	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	06e3ff6a-c02a-4dfb-84e4-7eaa21ec0098	ABU-1001	BMW 5 Series	luxury	2025-11-26 18:09:38.729285	available	4	3	t	75.00	3.50	t	Black	/images/vehicles/bmw_7_series_luxury__14fb90b3.jpg	\N
32e5e3c1-d52e-4f16-8e0f-55a3605f2ca9	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	32b6548e-dd3a-4e12-b045-759671263394	BMW-7-001	BMW 7 Series	first_class	2025-11-28 17:35:10.924991	available	4	3	t	75.00	3.50	t	Black	/images/vehicles/bmw_7_series_luxury__14fb90b3.jpg	\N
26229440-c91c-41c5-85a2-0bd94df6ab4d	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	26bcd573-1af6-4698-8990-8e95a063635a	GMC-YUKON-001	GMC Yukon	luxury_suv	2025-11-28 17:35:10.924991	available	6	5	t	75.00	3.50	t	White	/images/vehicles/cadillac_gmc_yukon_l_ba4108e8.jpg	\N
6475177d-4fd6-441f-b884-291d1d608d6e	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	21e2dd72-821f-4126-b480-091e8a7d04d4	MERC-V-001	Mercedes V Class	elite_van	2025-11-28 17:35:10.924991	available	7	5	t	75.00	3.50	t	Black	/images/vehicles/mercedes_sprinter_va_af7fed32.jpg	\N
a828f965-94da-4307-ba82-edbb9be30672	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	TESLA-3-001	Tesla Model 3	executive	2025-11-28 17:35:10.924991	on_trip	4	2	t	75.00	3.50	t	Black	/images/vehicles/tesla_model_3_model__07e528b0.jpg	\N
90f98f0f-ff38-403a-a88f-af437a607489	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	TESLA-Y-001	Tesla Model Y	executive	2025-11-28 17:35:10.924991	on_trip	5	3	t	75.00	3.50	t	Black	/images/vehicles/tesla_model_3_model__200a6474.jpg	\N
e4b8d71a-3ce6-4882-ba90-bcf747595eb6	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	MERC-E-001	Mercedes E Class	executive	2025-11-28 17:35:10.924991	on_trip	4	3	t	75.00	3.50	t	Black	/images/vehicles/mercedes_s_class_ext_5bfcf1a2.jpg	\N
0f1d5c26-2da3-45f9-9682-6fa3969fac1f	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	eb1175b3-0ab7-4134-a870-58c0397a139f	ABU-3001	Honda Civic	classic	2025-11-26 18:09:39.419005	on_trip	4	3	t	75.00	3.50	t	Black	/images/vehicles/toyota_corolla_honda_2ad82148.jpg	\N
1a77dc40-f880-45e2-88f1-d2c793ab63ff	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	GMC-CAT	GMC	urban_suv	2025-11-26 18:46:16.414021	on_trip	6	6	t	90.00	4.50	t	White	/images/vehicles/cadillac_gmc_yukon_l_ba4108e8.jpg	\N
113a84a1-b8f0-49fd-b70d-1012c3a04e18	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	BYD-SONG	BYD Song	urban_suv	2025-11-26 18:46:16.414021	on_trip	5	5	t	90.00	4.50	t	White	/images/vehicles/toyota_hiace_microbu_505726df.jpg	\N
bc9d9cec-1128-4fe9-b2ab-c37b99d6fed8	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	eff7f1c9-476d-4be1-b65d-572f9be22464	DXB-1002	Toyota Camry	classic	2025-11-26 18:09:38.037974	on_trip	4	3	t	75.00	3.50	t	Black	/images/vehicles/toyota_corolla_honda_4d95245a.jpg	\N
3bb629a9-68a1-4532-9828-d57271479f56	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	BMW7-CAT	BMW 7 Series	luxury	2025-11-26 18:46:16.414021	available	4	3	t	150.00	6.50	t	Black	/images/vehicles/bmw_7_series_luxury__d62c944c.jpg	\N
226c3fce-873e-440f-a0f5-fd1fa0e03c00	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	BYD-HAN	BYD Han	luxury	2025-11-26 18:46:16.414021	available	4	3	t	150.00	6.50	t	White	/images/vehicles/toyota_hiace_microbu_505726df.jpg	\N
f6e1a85e-db6f-4acf-a209-8e5c52808849	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	LEXUS-CAT	Lexus	luxury	2025-11-26 18:46:16.414021	available	4	3	t	150.00	6.50	t	Silver	/images/vehicles/toyota_hiace_microbu_4a4820d3.jpg	\N
3ba9706d-7654-46f2-9b77-9dc8811a8dc2	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	7983e2e1-14b7-49bd-a15f-988038a17e51	MERC-SPRINTER-001	Mercedes Sprinter	mini_bus	2025-11-28 17:35:10.924991	available	12	8	t	75.00	3.50	t	Black	/images/vehicles/mercedes_sprinter_va_af7fed32.jpg	\N
da82e6c3-bacc-404a-b7e5-7095e832adfa	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	bbbb251b-e07d-4434-8c29-9461292d9c51	DXB-1001	Toyota Corolla	classic	2025-11-26 18:09:37.806737	on_trip	4	3	t	75.00	3.50	t	Black	/images/vehicles/toyota_corolla_honda_dabd56a3.jpg	\N
bf2f71f5-7e19-4f57-b251-251c87ee6c66	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	26bcd573-1af6-4698-8990-8e95a063635a	ABU-2001	Range Rover	urban_suv	2025-11-26 18:09:39.189153	available	4	3	t	75.00	3.50	t	Black	/images/vehicles/toyota_highlander_fo_e64edbe4.jpg	\N
39a0593a-df17-4684-9159-4add0bb98c6d	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	MERCEDES-V	Mercedes V Class	elite_van	2025-11-26 18:46:16.414021	available	7	7	t	120.00	5.00	t	Black	/images/vehicles/mercedes_sprinter_va_af7fed32.jpg	\N
7ad96261-ddbc-4a64-b177-7575d522071c	e03e6fff-575b-4bb3-9ff6-1c92394fe94e	7983e2e1-14b7-49bd-a15f-988038a17e51	ABU-1002	Mercedes E-Class	luxury	2025-11-26 18:09:38.958822	available	4	3	t	75.00	3.50	t	Black	/images/vehicles/audi_a8_exterior_lux_b6800e9d.jpg	\N
a0ae0a08-331e-4784-ab87-8fd9b264fdb9	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	TESLA-CAT	Tesla	luxury	2025-11-26 18:46:16.414021	available	4	2	t	150.00	6.50	t	Black	/images/vehicles/range_rover_lexus_lu_97f3e706.jpg	\N
c5f8c7d0-9344-4ba7-9fac-879f3f6e466a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	CADILLAC-ESC-001	Cadillac Escalade	luxury_suv	2025-11-28 17:35:10.924991	available	7	5	t	75.00	3.50	t	Black	/images/vehicles/cadillac_gmc_yukon_l_06779f14.jpg	\N
e6fd3c76-4c66-4722-9119-b4ce4320bfb1	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	MINI-001	Toyota Hiace	mini_bus	2025-11-26 19:15:40.569547	available	14	8	t	110.00	5.50	t	Black	/images/vehicles/mercedes_sprinter_va_3e1f78be.jpg	\N
3e742f31-9e12-4852-a126-7ef790fc7033	67d97a9a-dfb4-411c-b3e5-a716235598c1	26bcd573-1af6-4698-8990-8e95a063635a	DEMO104	GMC Yukon	luxury_suv	2025-11-30 03:15:54.421093	available	5	4	t	50.00	1.50	t	White	\N	\N
d0e18893-9cee-45ff-9d55-37951100b64b	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	b5d713bb-17d8-4c02-ba03-5beb243c79e8	DXB-2002	GMC Yukon	urban_suv	2025-11-26 18:09:38.499456	available	4	3	t	75.00	3.50	t	White	/images/vehicles/cadillac_gmc_yukon_l_ba4108e8.jpg	\N
1d0ac375-e4c6-4fce-8db6-60bbda20931a	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	9f547d39-af55-4b02-86d2-3b5a5b70c8fb	DXB-2001	Ford Explorer	urban_suv	2025-11-26 18:09:38.267954	available	4	3	t	75.00	3.50	t	Black	/images/vehicles/toyota_highlander_fo_7bd096d2.jpg	\N
9b5cda84-9870-4ec9-a5d7-7a95ad90269c	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	MERC-S-001	Mercedes S Class	first_class	2025-11-28 17:35:10.924991	available	4	3	t	75.00	3.50	t	Black	/images/vehicles/mercedes_s_class_ext_1b7b47eb.jpg	\N
7d41bbfe-960f-45a6-8e2b-f8efbf44b190	3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	\N	AUDI-A8-001	Audi A8	first_class	2025-11-28 17:35:10.924991	available	4	3	t	75.00	3.50	t	Black	/images/vehicles/audi_a8_exterior_lux_54a179bd.jpg	\N
\.


--
-- Data for Name: vendor_payouts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendor_payouts (id, vendor_id, booking_id, vendor_amount, company_profit, created_at) FROM stdin;
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendors (id, name, phone, email, commission_rate, created_at, status, bank_account_number, bank_name, account_holder_name, logo_url, approval_reason, auto_assign_disabled, rejection_reason, password_hash) FROM stdin;
3bda5b46-1bf0-44be-967b-d9fcbcf4c9a7	Gold Rush Limo	+971501111111	gold@rush.ae	0.8	2025-11-26 18:09:33.61954	approved	123456789012	Emirates NBD	Gold Rush Limo	\N	Verified vendor	f	\N	\N
e03e6fff-575b-4bb3-9ff6-1c92394fe94e	Elite Rides	+971502222222	elite@rides.ae	0.75	2025-11-26 18:09:33.877091	approved	123456789012	Emirates NBD	Elite Rides	\N	Verified vendor	f	\N	\N
67d97a9a-dfb4-411c-b3e5-a716235598c1	Demo Vendor Co	+971501234567	demo@vendor.ae	0.8	2025-11-28 18:55:17.87981	approved	123456789	Emirates Bank	Demo Owner	\N	\N	f	\N	$2b$10$uUzzIThgmftxltRJtRkktOizQcH86.G5JP.8N/xOf6Af.1hTEmh6i
a4a826ca-945e-410d-9eb8-65f177ed2122	Test Vendor Company	+971501234567	vendor@test.com	0.8	2025-11-28 20:13:58.593144	approved	\N	\N	\N	\N	\N	f	\N	$2a$10$VIX8.OG.R1TKGB0qR9Y3muZPJBpXxNMKZ7m2D8t.vfW4c0rCt8Jme
e5a0a542-54f9-42bc-aa53-7986bbd0c7e0	Test Driver	+971501234567	driver@example.com	0.8	2025-11-30 22:36:18.329993	approved	\N	\N	\N	\N	\N	f	\N	\N
\.


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customers_id_seq', 51, true);


--
-- Name: notification_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notification_logs_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: booking_stops booking_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.booking_stops
    ADD CONSTRAINT booking_stops_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_external_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_external_id_key UNIQUE (external_id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: car_images car_images_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_images
    ADD CONSTRAINT car_images_pkey PRIMARY KEY (id);


--
-- Name: customers customers_phone_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_phone_key UNIQUE (phone);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: driver_ratings driver_ratings_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.driver_ratings
    ADD CONSTRAINT driver_ratings_booking_id_key UNIQUE (booking_id);


--
-- Name: driver_ratings driver_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.driver_ratings
    ADD CONSTRAINT driver_ratings_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: fare_rules fare_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fare_rules
    ADD CONSTRAINT fare_rules_pkey PRIMARY KEY (id);


--
-- Name: fare_rules fare_rules_vehicle_type_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.fare_rules
    ADD CONSTRAINT fare_rules_vehicle_type_key UNIQUE (vehicle_type);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: rental_rules rental_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rental_rules
    ADD CONSTRAINT rental_rules_pkey PRIMARY KEY (id);


--
-- Name: rental_rules rental_rules_vehicle_type_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rental_rules
    ADD CONSTRAINT rental_rules_vehicle_type_key UNIQUE (vehicle_type);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: vendor_payouts vendor_payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_payouts
    ADD CONSTRAINT vendor_payouts_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_logs_created; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_booking_stops_booking_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_booking_stops_booking_id ON public.booking_stops USING btree (booking_id);


--
-- Name: idx_booking_stops_stop_number; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_booking_stops_stop_number ON public.booking_stops USING btree (stop_number);


--
-- Name: idx_bookings_created_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_created_at ON public.bookings USING btree (created_at DESC);


--
-- Name: idx_bookings_type; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_bookings_type ON public.bookings USING btree (booking_type);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: booking_stops booking_stops_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.booking_stops
    ADD CONSTRAINT booking_stops_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- Name: bookings bookings_assigned_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_assigned_vehicle_id_fkey FOREIGN KEY (assigned_vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: bookings bookings_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: car_images car_images_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.car_images
    ADD CONSTRAINT car_images_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: driver_ratings driver_ratings_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.driver_ratings
    ADD CONSTRAINT driver_ratings_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: drivers drivers_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: payouts payouts_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: payouts payouts_vendor_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_vendor_id_fkey1 FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: vehicles vehicles_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- Name: vehicles vehicles_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: vendor_payouts vendor_payouts_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_payouts
    ADD CONSTRAINT vendor_payouts_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- Name: vendor_payouts vendor_payouts_vendor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_payouts
    ADD CONSTRAINT vendor_payouts_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

