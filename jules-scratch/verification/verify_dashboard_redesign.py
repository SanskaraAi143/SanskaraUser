import re
from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Use a unique email for each run to avoid "user already exists" errors
    email = f"testuser{int(time.time())}@example.com"
    password = "password123"

    try:
        # --- Sign Up ---
        print("Navigating to sign up page...")
        page.goto("http://localhost:8034/auth?mode=signup", timeout=60000)

        # Accept the cookie banner first
        page.get_by_role("button", name="Accept All").click()

        print("Filling out sign up form...")
        page.get_by_label("Full Name").fill("Test User")
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password", exact=True).fill(password)
        page.get_by_label("Confirm Password").fill(password)

        print("Submitting sign up form...")
        page.get_by_role("button", name="Create Account").click()

        # Wait for a moment to let the signup process
        page.wait_for_timeout(2000)

        # --- Sign In ---
        page.goto("http://localhost:8034/auth?mode=signin", timeout=60000)

        print("Filling out sign in form...")
        page.get_by_label("Email").fill(email)
        page.get_by_label("Password", exact=True).fill(password)

        print("Submitting sign in form...")
        page.get_by_role("button", name="Sign In").click()

        # Wait for navigation to the onboarding page, as this is a new user
        page.wait_for_url("**/onboarding", timeout=60000)
        print("Successfully navigated to onboarding.")

        # --- Onboarding ---
        print("Filling out onboarding form...")
        page.get_by_label("Partner 1 Name").fill("Partner One")
        page.get_by_label("Partner 2 Name").fill("Partner Two")
        page.get_by_label("Wedding Date").fill("2025-12-31")
        page.get_by_label("Wedding Location").fill("New York")
        page.get_by_label("Estimated Budget").fill("20000")

        print("Submitting onboarding form...")
        page.get_by_role("button", name="Create Wedding").click()

        # Wait for navigation to the dashboard
        page.wait_for_url("**/dashboard", timeout=60000)
        print("Successfully navigated to dashboard.")

        # Wait for a known element on the dashboard to be visible
        expect(page.get_by_role("heading", name=re.compile("Welcome, Partner One"))).to_be_visible(timeout=10000)

        print("Taking screenshot of the dashboard...")
        page.screenshot(path="jules-scratch/verification/dashboard_redesign.png")
        print("Screenshot taken successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
