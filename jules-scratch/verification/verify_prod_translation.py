from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the homepage
        page.goto("http://localhost:8080/")

        # Wait for a key element to be visible to ensure the page is loaded
        expect(page.get_by_role("heading", name="Plan Your Dream Hindu Wedding With AI")).to_be_visible()

        # Take a screenshot of the English version
        page.screenshot(path="jules-scratch/verification/verification_en_full.png")

        # Find and click the language toggle button
        language_button = page.get_by_role("button", name="తెలుగు")
        language_button.click()

        # Wait for the text to change and assert the new language
        expect(page.get_by_role("heading", name="మీ కలను ప్లాన్ చేసుకోండి హిందూ వివాహం AI తో")).to_be_visible()

        # Take a screenshot of the Telugu version
        page.screenshot(path="jules-scratch/verification/verification_te_full.png")

        browser.close()

if __name__ == "__main__":
    run_verification()