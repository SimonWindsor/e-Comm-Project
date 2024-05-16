--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    number_street character varying(30) NOT NULL,
    locality character varying(20) NOT NULL,
    state_province character varying(20) NOT NULL,
    country character varying(20) NOT NULL,
    zipcode character varying(10) NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    items text[],
    user_id uuid NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: item_pictures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.item_pictures (
    file character varying(36) NOT NULL,
    main_picture boolean NOT NULL,
    id uuid NOT NULL,
    item_id uuid NOT NULL
);


ALTER TABLE public.item_pictures OWNER TO postgres;

--
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    description text,
    num_available integer NOT NULL,
    price money NOT NULL,
    name character varying(20) NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE public.items OWNER TO postgres;

--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    "timestamp" timestamp without time zone NOT NULL,
    first_name character varying(15) NOT NULL,
    last_name character varying(15) NOT NULL,
    user_id uuid NOT NULL,
    items text[] NOT NULL,
    id uuid NOT NULL,
    delivery_address_id uuid NOT NULL
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    rating integer NOT NULL,
    review text NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    user_id uuid NOT NULL,
    item_id uuid NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: specials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.specials (
    end_date date NOT NULL,
    end_time time without time zone NOT NULL,
    price money NOT NULL,
    item_id uuid NOT NULL
);


ALTER TABLE public.specials OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    email character varying(30) NOT NULL,
    first_name character varying(15) NOT NULL,
    last_name character varying(15) NOT NULL,
    phone_number character varying(15) NOT NULL,
    username character varying(20) NOT NULL,
    password text NOT NULL,
    id uuid NOT NULL,
    address_id uuid NOT NULL,
    profile_picture character varying(36)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (number_street, locality, state_province, country, zipcode, id) FROM stdin;
10 Smith Street	Smithton	Tasmania	Australia	7330	6cb71fda-46ad-4d6a-ac9c-69f5280ab368
10 Sun Street	Birtinya	Queensland	Australia	4575	19b1a22e-f7d5-41c5-8e3c-631c8f5e44fc
70 5th Avenue	Happy Town	Colorado	USA	99222	456e7451-c22a-44c4-aff7-54dbf14a636d
12 Cloud Street	Happy Town	Devon	England	EH21 6UU	af9a17fe-551d-455d-8913-9308509c78d4
11 Smith Street	Smithton	Tasmania	Australia	7330	9335efab-3f4d-40fe-a6fb-2b61edabec91
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (items, user_id) FROM stdin;
\.


--
-- Data for Name: item_pictures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.item_pictures (file, main_picture, id, item_id) FROM stdin;
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (description, num_available, price, name, id) FROM stdin;
Eliminates any itch, espcially on your back	32	$6.00	Back Scratcher	2c88c134-dfb2-4bea-ab37-45961cb4c015
Your cat will love it!	20	$12.99	Cat Post	fec31be3-6558-42a8-bfeb-4802d89dfa34
Great for novice mechanics and DIY	39	$89.99	Drivers and Sockets	e64bea73-2500-42f7-94a8-7c69b2ceaf9e
More sponges for less!	14	$13.99	30 Scouring Sponges	5ae5a203-52e0-4eae-902a-911da25026b4
Your canine will want even more walks now!	27	$29.99	Dog Leash	cb9c1c45-e3b7-487d-a4ad-7c2677606b6a
Curl, Straighten, any style can be yours!	85	$59.99	Hair Styling Wand	b40f082c-c048-4217-b8e9-8332bfa86e9e
Troll your friends, or ust use as a doll	45	$12.99	Troll Doll	57dd0e78-4bfd-44ab-adf6-4e80a33edb21
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases ("timestamp", first_name, last_name, user_id, items, id, delivery_address_id) FROM stdin;
2024-04-17 22:12:40.125351	John	Smith	be680fa4-3cc0-4a5b-b4e3-356976279572	{"{\\"item\\":\\"e64bea73-2500-42f7-94a8-7c69b2ceaf9e\\",\\"quantity\\":1}"}	2d0b4c02-5130-4013-aaa2-95824c44a683	6cb71fda-46ad-4d6a-ac9c-69f5280ab368
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (rating, review, "timestamp", user_id, item_id, id) FROM stdin;
5	Works great when doing work on the ute! Highly Recommended!	2024-04-17 22:18:43.32592	be680fa4-3cc0-4a5b-b4e3-356976279572	e64bea73-2500-42f7-94a8-7c69b2ceaf9e	c367347d-f569-41f6-a9ee-9d0c886c0ff2
\.


--
-- Data for Name: specials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.specials (end_date, end_time, price, item_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (email, first_name, last_name, phone_number, username, password, id, address_id, profile_picture) FROM stdin;
jsmith@fakemail.com	John	Smith	+61 411 222 333	J-Smitty	$2b$10$udFpHsMsSS2dkj6YREqnRebGwP7nEqOjtl7l9NupbjByw/Qca2YCi	be680fa4-3cc0-4a5b-b4e3-356976279572	6cb71fda-46ad-4d6a-ac9c-69f5280ab368	image0_01.jpg
gh@fakemail.com	Greg	Hughes	+61 422 999 888	G_Hughes	$2b$10$udFpHsMsSS2dkj6YREqnRebGwP7nEqOjtl7l9NupbjByw/Qca2YCi	148ab681-11dd-44c3-88bf-dd1f07f32e41	19b1a22e-f7d5-41c5-8e3c-631c8f5e44fc	image0_0.jpg
big_ben@fakemail.com	Ben	Thompson	+1 999 111 555	BigBen	$2b$10$udFpHsMsSS2dkj6YREqnRebGwP7nEqOjtl7l9NupbjByw/Qca2YCi	5aa7469d-cc61-49fd-a62d-667b5029fa7d	456e7451-c22a-44c4-aff7-54dbf14a636d	image0_02.jpg
special_j@fakemail.com	Jim	Jones	+44 222 333 444	SpecialJ	$2b$10$udFpHsMsSS2dkj6YREqnRebGwP7nEqOjtl7l9NupbjByw/Qca2YCi	93fffec2-5565-47ea-9a4a-410e64c0904a	af9a17fe-551d-455d-8913-9308509c78d4	image1_0.jpg
bsmith@fakemail.com	Bob	Smith	+61 444 444 444	Bobby81	$2b$10$udFpHsMsSS2dkj6YREqnRebGwP7nEqOjtl7l9NupbjByw/Qca2YCi	97ad0955-40ae-44c6-9a86-170dfaf9caa0	9335efab-3f4d-40fe-a6fb-2b61edabec91	image1_0-1.jpg
\.


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (user_id);


--
-- Name: item_pictures item_pictures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_pictures
    ADD CONSTRAINT item_pictures_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: specials specials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specials
    ADD CONSTRAINT specials_pkey PRIMARY KEY (item_id);


--
-- Name: users unique_username; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users fk_address_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_address_id FOREIGN KEY (address_id) REFERENCES public.addresses(id);


--
-- Name: purchases fk_delivery_address_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT fk_delivery_address_id FOREIGN KEY (delivery_address_id) REFERENCES public.addresses(id);


--
-- Name: item_pictures fk_item_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.item_pictures
    ADD CONSTRAINT fk_item_id FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: reviews fk_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: reviews item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT item_id_fk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: specials item_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.specials
    ADD CONSTRAINT item_id_fk FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- PostgreSQL database dump complete
--

