FROM python:3.13-slim

# Instala git y otras dependencias del sistema
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# Configura usuario y correo global para git
RUN git config --global user.email "noreply@agorapay.com" && git config --global user.name "Agorapay Bot"

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY app ./app

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]