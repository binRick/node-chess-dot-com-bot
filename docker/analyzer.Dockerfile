FROM python:3.10-slim

RUN apt-get update && \
    apt-get install -y stockfish && \
    rm -rf /var/lib/apt/lists/*

# Add websockets here
RUN pip install --no-cache-dir python-chess websockets

WORKDIR /app
CMD ["python", "Analyzer.py"]

