from playwright.sync_api import sync_playwright

def verify_auth_page_design():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate directly to the signup mode to be explicit
            page.goto("http://localhost:8030/auth?mode=signup", timeout=60000)

            # Wait for a fixed time to allow for any rendering delays
            page.wait_for_timeout(3000)

            # Take a screenshot for debugging
            page.screenshot(path="jules-scratch/verification/auth_page_debug.png")
            print("Debug screenshot taken successfully.")

        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/auth_page_error_debug.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_auth_page_design()
