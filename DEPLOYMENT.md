# Deployment Guide

This guide covers the necessary steps to deploy the Momentum application to Vercel and configure Supabase Authentication for the live environment.

## 1. Setup Vercel

If you haven't already linked your GitHub repository to Vercel, you can do so by creating a new project in the Vercel Dashboard and selecting your `op_planner2` GitHub repository.

The `vercel.json` file in the root directory already configures Vercel to serve the frontend as static files and the backend as Serverless Functions (`/api/*` routes).

## 2. Configure Vercel Environment Variables

Vercel needs environment variables for the backend API to function correctly in the cloud.

1. Go to your Vercel Dashboard -> Project (`op-planner2`) -> **Settings** -> **Environment Variables**.
2. Add the following variables (you can find these in your local `backend/.env` file):
   - `MONGODB_URI`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SESSION_SECRET`
   - `GEMINI_API_KEY` (if used)

3. Once added, you should **redeploy** your application to ensure the Serverless Functions load these new variables:
   - Go to the **Deployments** tab.
   - Click **Redeploy** on the latest deployment.

## 3. Enable Google OAuth in Supabase

Since you are logging in with Google, you need to enable the Google provider in your Supabase project.

1. Go to your **Supabase Dashboard** -> **Authentication** -> **Providers**.
2. Select **Google** and toggle it **Enable**.
3. Use the credentials from your local `backend/.env` file:
   - Enter your `GOOGLE_CLIENT_ID` into the **Client ID** field.
   - Enter your `GOOGLE_CLIENT_SECRET` into the **Client Secret** field.
4. From the Google provider settings in Supabase, copy the **Callback URL**.
5. Go to your **Google Cloud Console**, find your OAuth 2.0 Client ID settings, and ensure that Callback URL is added as an **Authorized redirect URI**.
6. Click **Save** in Supabase.

## 4. Configure Supabase Authorized Redirects

Supabase Authentication (like Google OAuth) requires you to whitelist the URLs that it is allowed to redirect users back to after they log in. Since the site is now live, you must authorize the live URL.

1. Go to your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Under **Site URL**, you may leave your main URL or change it to `https://op-planner2.vercel.app/`.
3. Under **Redirect URIs**, add your Vercel deployment URL exactly like this:
   `https://op-planner2.vercel.app/**`
4. Click **Save**.

## 4. Test the Live Site

Visit `https://op-planner2.vercel.app/` and attempt to log in using Google OAuth. If the redirect succeeds and your tasks/goals load, the deployment is fully configured!
