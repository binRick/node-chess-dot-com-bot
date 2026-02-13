FROM python:3.10-slim

RUN apt-get update && \
    apt-get install -y stockfish && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir python-chess

WORKDIR /app
# Removed COPY Analyzer.py .
CMD ["python", "Analyzer.py"]

