#!/usr/bin/env python3
from playwright.sync_api import sync_playwright
IMG = 'chess_board_only_stable.png'
def capture_stable():
    with sync_playwright() as p:
        try:
            # Connect to your existing Chrome instance
            browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")

            target_page = None
            for context in browser.contexts:
                pages = context.pages
                for page in pages:
                    if "chess.com" in page.url:
                        target_page = page
                        break
                if target_page:
                    break

            if target_page:
                print("Attempting capture without context error...")
                
                # Use evaluate() to force the JS context to be active right now
                # We do this instead of a timeout
                target_page.evaluate("() => navigator.userAgent") 

                # Capture the board specifically
                board = target_page.query_selector("wc-chess-board") or target_page.query_selector("#board-layout-main")

                if board:
                    board.screenshot(path=IMG)
                    print("Board captured in background!")
                else:
                    target_page.screenshot(path="chess_fallback_stable.png")
                    print("Board element not found.")

            else:
                print("Error: Chess.com tab not found.")

        except Exception as e:
            print(f"Connection failed: {e}")

if __name__ == "__main__":
    capture_stable()


