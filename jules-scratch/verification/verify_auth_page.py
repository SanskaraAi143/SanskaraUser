from playwright.sync_api import sync_playwright, expect

def verify_auth_page_design():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            page.goto("http://localhost:8030/auth", timeout=60000)

            # Wait for the card title to be visible
            card_title = page.get_by_role("heading", name="Create an Account")
            expect(card_title).to_be_visible(timeout=30000)

            # Take a screenshot of the auth page
            page.screenshot(path="jules-scratch/verification/auth_page_verification.png")
            print("Auth page screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/auth_page_error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_auth_page_design()
