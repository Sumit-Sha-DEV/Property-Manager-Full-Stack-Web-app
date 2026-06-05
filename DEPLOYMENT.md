# Production Deployment Guide: Property Manager

This guide walks you through the step-by-step process of hosting the **Property Manager** web application in production. 

The application is built using **Next.js**, **Supabase** (PostgreSQL database & Authentication), and **Cloudinary** (Image & Video hosting). We will host the frontend and serverless backend on **Vercel**.

---

## Prerequisites

Before starting, make sure you have:
1. A [GitHub](https://github.com) account.
2. A [Supabase](https://supabase.com) account (free tier).
3. A [Cloudinary](https://cloudinary.com) account (free tier).
4. A [Vercel](https://vercel.com) account (free tier).

---

## Step 1: Push Code to GitHub

Next.js is most easily deployed to Vercel via GitHub, which sets up automatic CI/CD (every push automatically rebuilds and deploys).

1. Initialize git (if not already done) and commit your code:
   ```bash
   git init
   git add .
   git commit -m "Initialize project for deployment"
   ```
2. Create a new **private** or public repository on GitHub.
3. Link your local project to GitHub and push:
   ```bash
   git remote add origin https://github.com/your-username/property-manager.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Set Up Supabase (Database & Auth)

1. **Create Project**: Go to [Supabase](https://supabase.com) and click **New Project**. Choose a region close to your users and set a secure database password.
2. **Execute Database Schema & Indexes**:
   - In the left menu of the Supabase dashboard, click on **SQL Editor**.
   - Click **New query**.
   - Copy the contents of your local [supabase_schema.sql](file:///c:/Users/USER/OneDrive/Desktop/property%20manager/supabase_schema.sql) file, paste it into the query editor, and click **Run**. This creates the base tables and sets up Row Level Security (RLS) policies.
   - Click **New query** again, copy the contents of [supabase_indexes.sql](file:///c:/Users/USER/OneDrive/Desktop/property%20manager/supabase_indexes.sql), paste it in, and click **Run**. This creates indices on foreign keys and sorting columns to optimize query speeds.
3. **Configure Authentication**:
   - Go to **Auth** -> **Providers** -> **Email**.
   - Ensure **Enable Signup** is toggled ON.
   - *(Optional)* Disable **Confirm email** if you want users to log in immediately without verifying their email address.
4. **Get API Credentials**:
   - Go to **Project Settings** (gear icon) -> **API**.
   - Copy the **Project URL** (used for `NEXT_PUBLIC_SUPABASE_URL`).
   - Copy the **API key / anon / public** key (used for `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

---

## Step 3: Set Up Cloudinary (Image & Video Storage)

Cloudinary handles secure media uploads and optimized delivery.

1. **Get Credentials**:
   - Log into your [Cloudinary Dashboard](https://cloudinary.com).
   - In the Product Environment Credentials section, copy:
     - **Cloud Name** (used for `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`)
     - **API Key** (used for `CLOUDINARY_API_KEY`)
     - **API Secret** (used for `CLOUDINARY_API_SECRET`)

---

## Step 4: Deploy to Vercel

1. Log into [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. **Import Git Repository**: Find your `property-manager` repository and click **Import**.
3. **Configure Build Settings**: Vercel automatically detects Next.js. You can leave the build settings as default.
4. **Configure Environment Variables**:
   - Expand the **Environment Variables** dropdown.
   - Refer to your [.env.example](file:///c:/Users/USER/OneDrive/Desktop/property%20manager/.env.example) and add the following keys and values:
     ```env
     NEXT_PUBLIC_SUPABASE_URL           = <your-supabase-url>
     NEXT_PUBLIC_SUPABASE_ANON_KEY       = <your-supabase-anon-key>
     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME  = <your-cloudinary-cloud-name>
     CLOUDINARY_API_KEY                 = <your-cloudinary-api-key>
     CLOUDINARY_API_SECRET              = <your-cloudinary-api-secret>
     ```
5. Click **Deploy**. Vercel will build your application and generate a production URL (e.g., `https://property-manager-three.vercel.app`).

---

## Step 5: Post-Deployment Configuration (Supabase Auth Redirects)

To ensure users are redirected back to your web app after confirming sign-ups or logging in:

1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`).
2. In your Supabase Dashboard, go to **Auth** -> **URL Configuration**.
3. **Site URL**: Paste your Vercel deployment URL (e.g., `https://your-app.vercel.app`).
4. **Redirect URLs**: Click **Add URL** and add the following patterns (replacing `your-app.vercel.app` with your actual domain):
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/auth/confirm`
5. Click **Save**.

---

## Testing Your Production Build Locally

Before pushing to GitHub, you can test how the application behaves in a production-like environment on your local machine:

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```
3. Open [http://localhost:3000](http://localhost:3000) to test functionality (uploads, listings, client matching).
