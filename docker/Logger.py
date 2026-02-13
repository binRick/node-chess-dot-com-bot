import datetime
import json
import os
import chess
from mitmproxy import http

# The Verified Chess.com TCN map: '(' is index 0 (a1), 'h' is index 63 (h8)
TCN_MAP = "() *+,-./0123456789:;<=>?@ABCDEFGH IJKLMNOPQRSTUVWXYZ[\]^_`abcdefgh"

class ReliableChess:
    def __init__(self):
        self.board = chess.Board()
        self.log_dir = "/home/mitmproxy/logs"
        self.raw_log = os.path.join(self.log_dir, "raw_moves.log")
        self.bin_log = os.path.join(self.log_dir, "binary_moves.log")
        self.fen_log = os.path.join(self.log_dir, "game_state.log")

    def write(self, path, data):
        try:
            with open(path, "a") as f:
                f.write(f"{data}\n")
        except Exception:
            pass

    def handle_msg(self, payload, side):
        # Skip small keep-alive frames (all zeros or short)
        if len(payload) <= 15: return

        ts = datetime.datetime.now().strftime("%H:%M:%S")
        try:
            content = payload.decode("utf-8", "ignore")
            json_start = content.find('{')
            if json_start == -1: return
            
            # LOG 1: RAW JSON (The "Firehose")
            json_str = content[json_start:]
            data = json.loads(json_str)

            # Auto-Reset board if a new game setup is detected
            if "fullLog" in data or "fen" in data:
                self.board = chess.Board(data.get("fen", chess.STARTING_FEN))
                self.write(self.fen_log, f"--- BOARD RESET (New Game/Sync) ---")

            tcn = None
            # Detect the latest move code
            if "move" in data:
                tcn = data["move"]
            elif "moves" in data and isinstance(data["moves"], list):
                last_item = data["moves"][-1]
                tcn = last_item if isinstance(last_item, str) else last_item[0]

            if tcn:
                # LOG 2: RAW HEX (Just the binary move frame)
                self.write(self.bin_log, f"[{ts}] {side} | TCN: {tcn} | HEX: {payload.hex(' ')}")
                
                # LOG 3: RAW JSON
                self.write(self.raw_log, f"[{ts}] {side} | {json_str}")

                # Convert TCN to UCI (e.g., 'ge' -> 'e2e4')
                from_idx = TCN_MAP.index(tcn[0])
                to_idx = TCN_MAP.index(tcn[1])
                move = chess.Move(from_idx, to_idx)

                # UPDATE BOARD (Force pieces to move even if illegal to maintain sync)
                try:
                    self.board.push(move)
                except:
                    piece = self.board.piece_at(from_idx) or chess.Piece(chess.PAWN, self.board.turn)
                    self.board.remove_piece_at(from_idx)
                    self.board.set_piece_at(to_idx, piece)
                
                # LOG 4: DECODED FEN
                res = f"[{ts}] {side:3} | {move.uci():4} | FEN: {self.board.fen()}"
                self.write(self.fen_log, res)
                print(f"!!! {res}", flush=True)

        except Exception: pass

monitor = ReliableChess()

def websocket_message(flow: http.HTTPFlow):
    if "rsocket" in flow.request.path or "service/play" in flow.request.path:
        msg = flow.websocket.messages[-1]
        monitor.handle_msg(msg.content, "YOU" if msg.from_client else "SRV")

