import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Go to the login page
        await page.goto("http://localhost:8030/auth?mode=signin")

        # Expect the page to have the correct title for the sign-in page
        await expect(page).to_have_title("Sign In - Sanskara AI")

        # Fill in the email and password
        await page.get_by_label("Email").fill("kpuneeth714@gmail.com")
        await page.get_by_label("Password").fill("123456")

        # Click the sign-in button
        await page.get_by_role("button", name="Sign In").click()

        # Wait for the navigation to the dashboard and for the heading to be visible
        await expect(page.get_by_role("heading", name="Your Wedding Dashboard")).to_be_visible(timeout=15000)

        # Take a screenshot of the new dashboard layout
        await page.screenshot(path="jules-scratch/verification/01_dashboard_layout.png")

        # Find and click the "Invite Collaborator" button
        invite_button = page.get_by_role("button", name="Invite Collaborator")
        await expect(invite_button).to_be_visible()
        await invite_button.click()

        # Wait for the modal to appear
        await expect(page.get_by_role("heading", name="Invite a Collaborator")).to_be_visible()

        # Take a screenshot of the invite modal
        await page.screenshot(path="jules-scratch/verification/02_invite_modal.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())