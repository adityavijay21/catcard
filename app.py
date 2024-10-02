from dotenv import load_dotenv
import os

load_dotenv()

# Use environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
# Other configurations...