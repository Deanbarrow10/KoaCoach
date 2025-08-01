# ---- Base image ----
    FROM python:3.11-slim

    # ---- System prep ----
    ENV PYTHONDONTWRITEBYTECODE=1 \
        PYTHONUNBUFFERED=1 \
        PORT=8080
    
    WORKDIR /app
    
    # ---- Install deps ----
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    
    # ---- Copy app ----
    COPY . .
    
    # ---- Expose & launch ----
    EXPOSE 8080
    CMD ["gunicorn", "-k", "gthread", "-w", "2", "-b", "0.0.0.0:8080", "app:app"]
    