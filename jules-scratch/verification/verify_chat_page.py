import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_chat_page(page: Page):
    """
    This script verifies the new futuristic chat UI.
    1. Navigates directly to the chat page.
    2. Confirms the main elements of the chat page are visible.
    3. Takes a screenshot of the final state.
    """
    # 1. Navigate directly to the chat page
    print("Navigating directly to the chat page...")
    page.goto("http://localhost:8032/chat")

    # 2. Confirm the chat page has loaded
    print("Verifying chat page elements...")
    expect(page).to_have_url(re.compile(r'/chat$'))
    heading = page.get_by_role("heading", name="Sanskara")
    expect(heading).to_be_visible()

    # 3. Take the final screenshot
    print("Taking final screenshot...")
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Final screenshot taken successfully.")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_chat_page(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    main()