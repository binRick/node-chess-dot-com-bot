import time
import os
import chess
import chess.engine

# Corrected paths for the container environment
LOG_FILE = "/app/logs/game_state.log"
BEST_MOVE_LOG = "/app/logs/best_moves.log"
ENGINE_PATH = "/usr/games/stockfish"

def get_best_move(fen):
    try:
        # Use context manager to handle engine lifecycle
        with chess.engine.SimpleEngine.popen_uci(ENGINE_PATH) as engine:
            board = chess.Board(fen)
            # 0.1s is sufficient for strong tactical suggestions
            result = engine.play(board, chess.engine.Limit(time=0.1))
            return result.move.uci()
    except Exception as e:
        return f"Error: {e}"

def watch():
    print("Analyzer is watching game_state.log...", flush=True)
    # Wait for the log file to be created
    while not os.path.exists(LOG_FILE):
        time.sleep(1)

    with open(LOG_FILE, "r") as f:
        # Move to the end of the file so we only analyze new moves
        f.seek(0, os.SEEK_END)
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.2)
                continue
            
            if "FEN:" in line:
                parts = line.split("FEN: ")
                if len(parts) > 1:
                    fen = parts[1].strip()
                    best_move = get_best_move(fen)
                    
                    ts = time.strftime('%H:%M:%S')
                    log_entry = f"{ts} | Best: {best_move} | FEN: {fen}"
                    
                    with open(BEST_MOVE_LOG, "a") as out:
                        out.write(log_entry + "\n")
                    print(f"!!! {log_entry}", flush=True)

if __name__ == "__main__":
    watch()

