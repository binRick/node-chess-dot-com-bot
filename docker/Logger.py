import datetime
import json
import os
import chess
from mitmproxy import http

# The Verified Modern Chess.com TCN Map (Base64-style indices)
TCN_MAP = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?"

class ReliableChess:
    def __init__(self):
        self.board = chess.Board()
        self.log_dir = "/home/mitmproxy/logs"
        self.last_move_id = None
        self.ensure_dir()
        self.fen_log = os.path.join(self.log_dir, "game_state.log")
        self.raw_log = os.path.join(self.log_dir, "raw_moves.log")

    def ensure_dir(self):
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir, exist_ok=True)

    def write(self, path, data):
        try:
            with open(path, "a") as f:
                f.write(f"{data}\n")
        except: pass

    def handle_msg(self, payload, side):
        if len(payload) <= 15: return
        ts = datetime.datetime.now().strftime("%H:%M:%S")

        try:
            start_idx = payload.find(b'{')
            if start_idx == -1: return
            
            content = payload[start_idx:].decode("utf-8", "ignore")
            data = json.loads(content)

            # 1. Sync Board State (Full Game Sync/Reset)
            if "fullLog" in data or "fen" in data:
                new_fen = data.get("fen", chess.STARTING_FEN)
                self.board = chess.Board(new_fen if ' ' in new_fen else f"{new_fen} w KQkq - 0 1")
                self.last_move_id = None
                self.write(self.fen_log, f"[{ts}] --- SYNC: {self.board.fen()}")
                return

            # 2. Extract TCN Move from RSocket Packet
            tcn = None
            move_count = 0
            if "move" in data:
                tcn = data["move"]
            elif "moves" in data and isinstance(data["moves"], list) and data["moves"]:
                move_count = len(data["moves"])
                last_item = data["moves"][-1]
                tcn = last_item if isinstance(last_item, str) else last_item[0]

            # 3. Deduplicate and Process
            current_id = f"{tcn}_{move_count}"
            if isinstance(tcn, str) and len(tcn) >= 2 and current_id != self.last_move_id:
                
                try:
                    from_sq = TCN_MAP.index(tcn[0])
                    to_sq = TCN_MAP.index(tcn[1])
                except (ValueError, IndexError): return

                promo = None
                if len(tcn) > 2:
                    promo_map = {'q': chess.QUEEN, 'r': chess.ROOK, 'b': chess.BISHOP, 'n': chess.KNIGHT}
                    promo = promo_map.get(tcn[2].lower())

                move = chess.Move(from_sq, to_sq, promotion=promo)

                # 4. Update Board State
                if move in self.board.legal_moves:
                    self.board.push(move)
                    status = "OK"
                    self.last_move_id = current_id
                else:
                    # Silence duplicate confirms, but catch actual sync issues
                    return 

                # 5. Final Output
                res = f"[{ts}] {side:3} | {move.uci():7} | {status:5} | FEN: {self.board.fen()}"
                self.write(self.fen_log, res)
                self.write(self.raw_log, f"[{ts}] {side} | TCN: {tcn} | JSON: {content}")
                print(f"!!! {res}", flush=True)

        except Exception as e:
            if "substring not found" not in str(e):
                self.write(self.fen_log, f"[{ts}] ERROR: {str(e)}")

monitor = ReliableChess()

def websocket_message(flow: http.HTTPFlow):
    path = flow.request.path.lower()
    if any(k in path for k in ["rsocket", "service/play"]):
        msg = flow.websocket.messages[-1]
        side = "YOU" if msg.from_client else "SRV"
        monitor.handle_msg(msg.content, side)

