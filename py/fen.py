#!/usr/bin/env python3
from board_to_fen.predict import get_fen_from_image_path

fen = get_fen_from_image_path("chess_board_only_stable.png")
print(fen)

