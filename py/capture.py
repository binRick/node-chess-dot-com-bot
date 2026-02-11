#!/usr/bin/env python3
import os
import time
from playwright.sync_api import sync_playwright

# 1. Silence Node.js deprecation warnings (DEP0169)
os.environ['NODE_OPTIONS'] = '--no-deprecation'

IMG = 'chess_board_only_stable.png'

def capture_perfect_crop():
    with sync_playwright() as p:
        try:
            # 2. Connect to the existing Chrome instance
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
                print("Error: Chess.com tab not found.")
                return

            # 3. Target the board and wait for stability
            board_selector = "wc-chess-board, #board-layout-main"
            target_page.wait_for_selector(board_selector, state="visible", timeout=10000)
            target_page.wait_for_load_state("networkidle")
            
            # Pause to ensure no "piece sliding" animations are captured
            time.sleep(0.5)

            board = target_page.query_selector(board_selector)

            if board:
                # 4. Get exact pixel coordinates of the board element
                bbox = board.bounding_box()
                
                if bbox:
                    # 5. PERFECT ASYMMETRIC TRIM:
                    # trim_left/bottom: 0.101 (10.1%) removes the "1-8" and "a-h" labels
                    # trim_top/right: 0.015 (1.5%) removes only the thin outer gray frame
                    trim_left = bbox['width'] * 0.101
                    trim_bottom = bbox['height'] * 0.101
                    trim_top = bbox['height'] * 0.055
                    trim_right = bbox['width'] * 0.015
                    
                    # 6. Capture with the tight clip
                    target_page.screenshot(
                        path=IMG,
                        clip={
                            "x": bbox['x'] + trim_left,
                            "y": bbox['y'] + trim_top,
                            "width": bbox['width'] - trim_left - trim_right,
                            "height": bbox['height'] - trim_top - trim_bottom
                        }
                    )
                    print(f"Success! Perfect tight-cropped board saved to: {IMG}")
            else:
                print("Error: Board element not found.")

        except Exception as e:
            if "Execution context was destroyed" in str(e):
                print("Navigation detected. Retrying...")
                capture_perfect_crop()
            else:
                print(f"Capture failed: {e}")

if __name__ == "__main__":
    capture_perfect_crop()

