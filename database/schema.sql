-- CiviMind AI Database Schema
-- Tailored for Supabase PostgreSQL

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES table (linked to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    preferred_lang VARCHAR(10) DEFAULT 'en', -- 'en' or 'ar'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- GOVERNMENT SERVICES table
CREATE TABLE IF NOT EXISTS public.gov_services (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- e.g., 'Visa', 'Labour', 'Business', 'Traffic', 'Rental', 'Consumer'
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    authority_en TEXT NOT NULL,
    authority_ar TEXT NOT NULL,
    url TEXT,
    steps_en JSONB,
    steps_ar JSONB,
    docs_required_en JSONB,
    docs_required_ar JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- CHATS table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- MESSAGES table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb, -- Store list of source citations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- DOCUMENTS table (metadata for uploaded files)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL, -- Supabase Storage link
    summary_en TEXT,
    summary_ar TEXT,
    highlights_en JSONB DEFAULT '[]'::jsonb,
    highlights_ar JSONB DEFAULT '[]'::jsonb,
    risks_en JSONB DEFAULT '[]'::jsonb,
    risks_ar JSONB DEFAULT '[]'::jsonb,
    deadlines_en JSONB DEFAULT '[]'::jsonb,
    deadlines_ar JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gov_services ENABLE ROW LEVEL SECURITY;
