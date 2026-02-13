#!/usr/bin/env python3
import os
import time
from playwright.sync_api import sync_playwright

# Silence Node.js deprecation warnings
os.environ['NODE_OPTIONS'] = '--no-deprecation'

IMG = 'chess_board_only_stable.png'

def capture_for_fen():
    with sync_playwright() as p:
        try:
            print("Connecting to browser...")
            # Connect to your existing Chrome instance
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

            # Target the board element
            board_selector = "wc-chess-board, #board-layout-main, .board"
            target_page.wait_for_selector(board_selector, state="visible", timeout=10000)
            
            # Wait for any piece animations to finish completely
            time.sleep(0.5)

            board = target_page.query_selector(board_selector)

            if board:
                bbox = board.bounding_box()
                
                if bbox:
                    # CRITICAL: board_to_fen needs ONLY the 64 squares.
                    # We crop INWARDS to remove the coordinate labels (1-8, a-h).
                    # On Chess.com, coordinates take up roughly 3.5% - 4% of the board area.
                    inner_trim = bbox['width'] * 0.041 
                    
                    target_page.screenshot(
                        path=IMG,
                        # scale="device" ensures high-res (Retina) quality for the AI
                        scale="device",
                        clip={
                            "x": bbox['x'] + inner_trim,
                            "y": bbox['y'],
                            "width": bbox['width'] - inner_trim,
                            "height": bbox['height'] - inner_trim
                        }
                    )
                    
                    size = os.path.getsize(IMG)
                    print(f"Success! Clean board saved: {IMG} ({size} bytes)")
                    print("Coordinates removed. AI should now detect the 8x8 grid.")
            else:
                print("Error: Board element not found.")

        except Exception as e:
            if "Execution context was destroyed" in str(e):
                print("Page reloaded. Retrying...")
                capture_for_fen()
            else:
                print(f"Capture failed: {e}")

if __name__ == "__main__":
    capture_for_fen()

