import time
import os
import chess
import chess.engine

LOG_FILE = "/app/logs/game_state.log"
BEST_MOVE_LOG = "/app/logs/best_moves.log"
STOCKFISH_PATH = "/app/engine/stockfish"

def get_best_move(fen):
    try:
        # Initialize engine connection
        engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
        board = chess.Board(fen)
        # Analyze for a short burst (0.1s)
        result = engine.play(board, chess.engine.Limit(time=0.1))
        engine.quit()
        return result.move.uci()
    except Exception as e:
        return f"Error: {e}"

def watch_logs():
    print("Analyzer started. Watching for FEN updates...")
    # Open the file and move to the end
    with open(LOG_FILE, "r") as f:
        f.seek(0, os.SEEK_END)
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.5) # Wait for new data
                continue
            
            # Detect lines containing FENs from your Logger.py
            if "FEN:" in line:
                fen = line.split("FEN: ")[1].strip()
                best_move = get_best_move(fen)
                
                output = f"{time.strftime('%H:%M:%S')} | FEN: {fen} | Best Move: {best_move}"
                with open(BEST_MOVE_LOG, "a") as out:
                    out.write(output + "\n")
                print(f"Analysis: {best_move}")

if __name__ == "__main__":
    # Wait for the log file to be created by the other container
    while not os.path.exists(LOG_FILE):
        time.sleep(1)
    watch_logs()

