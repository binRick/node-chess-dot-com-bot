#!/usr/bin/env python3
import os
import time

# 1. Disable Node.js deprecation warnings (DEP0169) before Playwright starts
os.environ['NODE_OPTIONS'] = '--no-deprecation'

from playwright.sync_api import sync_playwright

IMG = 'chess_board_only_stable.png'

def capture_board_only():
    with sync_playwright() as p:
        try:
            # 2. Connect to your existing Chrome instance in debug mode
            print("Connecting to browser...")
            browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")

            target_page = None
            for context in browser.contexts:
                for page in context.pages:
                    if "chess.com" in page.url:
                        target_page = page
                        break
                if target_page: break

            if not target_page:
                print("Error: Chess.com tab not found. Is your browser open to a game?")
                return

            print("Chess.com tab found. Waiting for board stability...")

            # 3. Use specialized selectors for Chess.com board elements
            # 'wc-chess-board' is the standard, '#board-layout-main' is a fallback
            board_selector = "wc-chess-board, #board-layout-main"
            
            # 4. Wait for the board to be visible and network to be idle
            # This prevents "Execution context was destroyed" errors during navigation
            target_page.wait_for_selector(board_selector, state="visible", timeout=10000)
            target_page.wait_for_load_state("networkidle")
            
            # Optional: Short sleep to ensure piece animations settle
            time.sleep(0.5)

            board = target_page.query_selector(board_selector)

            if board:
                # 5. Capture ONLY the board element (64 squares)
                # This removes UI noise that causes FEN detection to fail
                board.screenshot(path=IMG)
                print(f"Success! Board-only screenshot saved to: {IMG}")
            else:
                print("Error: Board element selector failed after finding page.")

        except Exception as e:
            if "Execution context was destroyed" in str(e):
                print("Navigation detected mid-capture. Retrying...")
                capture_board_only()
            else:
                print(f"Capture failed: {e}")

if __name__ == "__main__":
    capture_board_only()

