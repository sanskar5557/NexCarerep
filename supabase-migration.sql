-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  role text check (role in ('Patient', 'Doctor')),
  joined text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Profiles: Anyone can read doctors (for patient dashboard), but users can only update their own profile
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create appointments table
create table appointments (
  id uuid default gen_random_uuid() primary key,
  doctor_email text,
  doctor_name text,
  patient_email text,
  patient_name text,
  patient_initials text,
  status text default 'Pending',
  time text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on appointments
alter table appointments enable row level security;

-- Appointments: Doctors can read/update appointments where they are the doctor. Patients can read/insert appointments where they are the patient.
create policy "Users can view their own appointments" on appointments
  for select using (auth.jwt() ->> 'email' = doctor_email or auth.jwt() ->> 'email' = patient_email);

create policy "Patients can insert appointments" on appointments
  for insert with check (auth.jwt() ->> 'email' = patient_email);

create policy "Doctors can update their appointments" on appointments
  for update using (auth.jwt() ->> 'email' = doctor_email);

-- Create prescriptions table
create table prescriptions (
  id uuid default gen_random_uuid() primary key,
  doctor_email text,
  doctor_name text,
  patient_email text,
  patient_name text,
  notes text,
  date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on prescriptions
alter table prescriptions enable row level security;

-- Prescriptions: Doctors and Patients can view their related prescriptions. Doctors can insert.
create policy "Users can view their own prescriptions" on prescriptions
  for select using (auth.jwt() ->> 'email' = doctor_email or auth.jwt() ->> 'email' = patient_email);

create policy "Doctors can insert prescriptions" on prescriptions
  for insert with check (auth.jwt() ->> 'email' = doctor_email);
