from playwright.sync_api import sync_playwright, expect

def verify_auth_page_design():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Arrange: Go to the application's homepage.
            page.goto("http://localhost:8030/auth?mode=signup", timeout=60000)

            # 2. Act: Accept the cookie banner
            accept_button = page.get_by_role("button", name="Accept All")
            expect(accept_button).to_be_visible(timeout=10000)
            accept_button.click()

            # 3. Assert: Wait for the main heading to be visible.
            card_title = page.get_by_role("heading", name="Create an Account")
            expect(card_title).to_be_visible(timeout=10000)

            # 4. Screenshot: Capture the final result for visual verification.
            page.screenshot(path="jules-scratch/verification/auth_page_verification.png")
            print("Screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/auth_page_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_auth_page_design()
